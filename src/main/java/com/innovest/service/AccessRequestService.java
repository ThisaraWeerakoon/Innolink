package com.innovest.service;

import com.innovest.domain.*;
import com.innovest.repository.AccessRequestRepository;
import com.innovest.repository.DealRepository;
import com.innovest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AccessRequestService {

    @Autowired
    private AccessRequestRepository accessRequestRepository;

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public AccessRequest requestAccess(UUID dealId, UUID investorId) {
        if (accessRequestRepository.findByDealIdAndInvestorId(dealId, investorId).isPresent()) {
            throw new RuntimeException("Request already exists");
        }

        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        User investor = userRepository.findById(investorId)
                .orElseThrow(() -> new RuntimeException("Investor not found"));

        AccessRequest request = new AccessRequest();
        request.setDeal(deal);
        request.setInvestor(investor);
        request.setStatus(RequestStatus.PENDING);
        
        return accessRequestRepository.save(request);
    }

    @Transactional
    public AccessRequest approveRequest(UUID requestId, UUID innovatorId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getDeal().getInnovator().getId().equals(innovatorId)) {
            throw new RuntimeException("Not authorized to approve this request");
        }

        request.setStatus(RequestStatus.APPROVED);
        return accessRequestRepository.save(request);
    }

    @Transactional
    public AccessRequest signNda(UUID requestId, UUID investorId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getInvestor().getId().equals(investorId)) {
            throw new RuntimeException("Not authorized to sign NDA for this request");
        }

        if (request.getStatus() != RequestStatus.APPROVED) {
            throw new RuntimeException("Request must be approved before signing NDA");
        }

        request.setNdaSigned(true);
        return accessRequestRepository.save(request);
    }
    public AccessRequest getAccessRequest(UUID dealId, UUID investorId) {
        return accessRequestRepository.findByDealIdAndInvestorId(dealId, investorId).orElse(null);
    }
}
