package com.innovest.service;

import com.innovest.domain.*;
import com.innovest.dto.*;
import com.innovest.repository.AccessRequestRepository;
import com.innovest.repository.DealDocumentRepository;
import com.innovest.repository.DealRepository;
import com.innovest.repository.UserRepository;
import com.innovest.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
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

    public List<PublicDealDTO> getPublicDeals() {
        return dealRepository.findByStatus(DealStatus.ACTIVE).stream()
                .map(dealMapper::toPublicDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrivateDealDTO getPrivateDeal(UUID dealId, CustomUserDetails currentUser) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        boolean hasAccess = false;

        // 1. Owner (Innovator)
        if (deal.getInnovator().getId().equals(currentUser.getId())) {
            hasAccess = true;
        }
        // 2. Investor with APPROVED request and SIGNED NDA
        else if (currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_INVESTOR"))) {
            AccessRequest request = accessRequestRepository.findByDealIdAndInvestorId(dealId, currentUser.getId())
                    .orElse(null);
            
            if (request != null && request.getStatus() == RequestStatus.APPROVED && request.isNdaSigned()) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            throw new AccessDeniedException("You do not have access to this deal's private details.");
        }

        List<DealDocument> documents = dealDocumentRepository.findByDealId(dealId);
        List<DealDocumentDTO> documentDTOs = documents.stream()
                .map(dealMapper::toDocumentDto)
                .collect(Collectors.toList());

        return dealMapper.toPrivateDto(deal, documentDTOs);
    }
}
