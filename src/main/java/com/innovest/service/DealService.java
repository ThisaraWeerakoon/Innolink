package com.innovest.service;

import com.innovest.domain.*;
import com.innovest.dto.*;
import com.innovest.repository.AccessRequestRepository;
import com.innovest.repository.DealDocumentRepository;
import com.innovest.repository.DealRepository;
import com.innovest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DealService {

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private DealDocumentRepository dealDocumentRepository;

    @Autowired
    private AccessRequestRepository accessRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DealMapper dealMapper;

    @Transactional
    public Deal createDeal(Deal deal, UUID innovatorId) {
        User innovator = userRepository.findById(innovatorId)
                .orElseThrow(() -> new RuntimeException("Innovator not found"));
        deal.setInnovator(innovator);
        deal.setStatus(DealStatus.DRAFT);
        return dealRepository.save(deal);
    }

    @Transactional
    public Deal submitDealForApproval(UUID dealId, UUID userId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getInnovator().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You are not the owner of this deal");
        }

        if (deal.getStatus() != DealStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT deals can be submitted for approval");
        }

        deal.setStatus(DealStatus.PENDING_APPROVAL);
        return dealRepository.save(deal);
    }

    public List<Deal> getPendingDeals() {
        return dealRepository.findByStatus(DealStatus.PENDING_APPROVAL);
    }

    @Transactional
    public Deal approveDeal(UUID dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        deal.setStatus(DealStatus.ACTIVE);
        return dealRepository.save(deal);
    }

    @Transactional
    public Deal rejectDeal(UUID dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        deal.setStatus(DealStatus.REJECTED);
        return dealRepository.save(deal);
    }

    @Transactional
    public DealDocument addDocumentToDeal(UUID dealId, DealDocument document, UUID userId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        
        if (!deal.getInnovator().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You are not the owner of this deal");
        }

        document.setDeal(deal);
        document.setCreatedAt(java.time.LocalDateTime.now());
        return dealDocumentRepository.save(document);
    }

    public List<PublicDealDTO> getPublicDeals() {
        return dealRepository.findByStatus(DealStatus.ACTIVE).stream()
                .map(dealMapper::toPublicDto)
                .collect(Collectors.toList());
    }

    public List<Deal> getDealsByInnovator(UUID innovatorId) {
        return dealRepository.findByInnovatorId(innovatorId);
    }

    @Transactional(readOnly = true)
    public PrivateDealDTO getPrivateDeal(UUID dealId, UUID userId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean hasAccess = false;

        // 1. Owner (Innovator)
        if (deal.getInnovator().getId().equals(userId)) {
            hasAccess = true;
        }
        // 2. Investor with APPROVED request and SIGNED NDA
        else if (user.getRole() == UserRole.INVESTOR) {
            AccessRequest request = accessRequestRepository.findByDealIdAndInvestorId(dealId, userId)
                    .orElse(null);
            
            if (request != null && request.getStatus() == RequestStatus.APPROVED && request.isNdaSigned()) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            throw new RuntimeException("You do not have access to this deal's private details.");
        }

        List<DealDocument> documents = dealDocumentRepository.findByDealId(dealId);
        List<DealDocumentDTO> documentDTOs = documents.stream()
                .map(dealMapper::toDocumentDto)
                .collect(Collectors.toList());

        return dealMapper.toPrivateDto(deal, documentDTOs);
    }
}
