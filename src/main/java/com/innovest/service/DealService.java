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

    @Transactional(readOnly = true)
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
    public List<DealDTO> getAllActiveDeals(String sortBy, UUID innovatorId) {
        List<Deal> deals;
        if (innovatorId != null) {
            deals = dealRepository.findByInnovatorIdAndStatus(innovatorId, DealStatus.ACTIVE);
        } else if ("recent".equals(sortBy)) {
            deals = dealRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        } else {
            deals = dealRepository.findAll();
        }
        
        return deals.stream()
                .filter(deal -> deal.getStatus() == DealStatus.ACTIVE)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveDeal(UUID userId, UUID dealId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        user.getSavedDeals().add(deal);
        userRepository.save(user);
    }

    @Transactional
    public void unsaveDeal(UUID userId, UUID dealId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        user.getSavedDeals().remove(deal);
        userRepository.save(user);
    }

    public java.util.Set<DealDTO> getSavedDeals(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getSavedDeals().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toSet());
    }

    private DealDTO convertToDTO(Deal deal) {
        DealDTO dto = new DealDTO();
        dto.setId(deal.getId());
        dto.setTitle(deal.getTitle());
        dto.setTeaserSummary(deal.getTeaserSummary());
        dto.setTargetAmount(deal.getTargetAmount());
        dto.setIndustry(deal.getIndustry());
        dto.setStatus(deal.getStatus());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setInnovatorId(deal.getInnovator().getId());
        if (deal.getInnovator().getInnovatorProfile() != null) {
            dto.setInnovatorName(deal.getInnovator().getInnovatorProfile().getCompanyName());
        } else {
            dto.setInnovatorName(deal.getInnovator().getEmail());
        }
        if (deal.getDocuments() != null) {
            dto.setDocuments(deal.getDocuments().stream()
                    .map(dealMapper::toDocumentDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
