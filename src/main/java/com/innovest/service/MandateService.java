package com.innovest.service;

import com.innovest.domain.Mandate;
import com.innovest.domain.User;
import com.innovest.dto.MandateDTO;
import com.innovest.repository.MandateRepository;
import com.innovest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MandateService {

    private final MandateRepository mandateRepository;
    private final UserRepository userRepository;

    public List<MandateDTO> getAllMandates(String sortBy, UUID investorId) {
        List<Mandate> mandates;
        if (investorId != null) {
            mandates = mandateRepository.findByInvestorId(investorId);
        } else if ("recent".equals(sortBy)) {
            mandates = mandateRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        } else {
            mandates = mandateRepository.findAll();
        }
        
        return mandates.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveMandate(UUID userId, UUID mandateId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Mandate mandate = mandateRepository.findById(mandateId)
                .orElseThrow(() -> new RuntimeException("Mandate not found"));

        user.getSavedMandates().add(mandate);
        userRepository.save(user);
    }

    @Transactional
    public void unsaveMandate(UUID userId, UUID mandateId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Mandate mandate = mandateRepository.findById(mandateId)
                .orElseThrow(() -> new RuntimeException("Mandate not found"));

        user.getSavedMandates().remove(mandate);
        userRepository.save(user);
    }

    @Transactional
    public MandateDTO createMandate(MandateDTO dto, UUID investorId) {
        User investor = userRepository.findById(investorId)
                .orElseThrow(() -> new RuntimeException("Investor not found"));

        Mandate mandate = new Mandate();
        mandate.setTitle(dto.getTitle());
        mandate.setDescription(dto.getDescription());
        mandate.setTargetIndustry(dto.getTargetIndustry());
        mandate.setStagePreference(dto.getStagePreference());
        mandate.setMinTicketSize(dto.getMinTicketSize());
        mandate.setMaxTicketSize(dto.getMaxTicketSize());
        mandate.setGeography(dto.getGeography());
        mandate.setCurrency(dto.getCurrency());
        mandate.setInvestor(investor);
        
        Mandate savedMandate = mandateRepository.save(mandate);
        return convertToDTO(savedMandate);
    }

    public Set<MandateDTO> getSavedMandates(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getSavedMandates().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toSet());
    }

    private final com.innovest.repository.MandateInterestRepository mandateInterestRepository;

    public boolean checkInterest(UUID mandateId, UUID innovatorId) {
        return mandateInterestRepository.findByMandateIdAndInnovatorId(mandateId, innovatorId).isPresent();
    }

    @Transactional
    public void expressInterest(UUID mandateId, UUID innovatorId) {
        if (checkInterest(mandateId, innovatorId)) {
            return; // Already interested
        }

        Mandate mandate = mandateRepository.findById(mandateId)
                .orElseThrow(() -> new RuntimeException("Mandate not found"));
        User innovator = userRepository.findById(innovatorId)
                .orElseThrow(() -> new RuntimeException("Innovator not found"));

        com.innovest.domain.MandateInterest interest = new com.innovest.domain.MandateInterest();
        interest.setMandate(mandate);
        interest.setInnovator(innovator);
        interest.setStatus("PENDING");
        
        mandateInterestRepository.save(interest);
    }

    public List<com.innovest.dto.MandateInterestDTO> getInterestsForMandate(UUID mandateId) {
        return mandateInterestRepository.findByMandateId(mandateId).stream()
                .map(this::convertToInterestDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateInterestStatus(UUID interestId, String status) {
        com.innovest.domain.MandateInterest interest = mandateInterestRepository.findById(interestId)
                .orElseThrow(() -> new RuntimeException("Interest not found"));
        interest.setStatus(status);
        mandateInterestRepository.save(interest);
    }

    private com.innovest.dto.MandateInterestDTO convertToInterestDTO(com.innovest.domain.MandateInterest interest) {
        com.innovest.dto.MandateInterestDTO dto = new com.innovest.dto.MandateInterestDTO();
        dto.setId(interest.getId());
        dto.setMandateId(interest.getMandate().getId());
        dto.setInnovatorId(interest.getInnovator().getId());
        dto.setInnovatorEmail(interest.getInnovator().getEmail());
        dto.setStatus(interest.getStatus());
        dto.setCreatedAt(interest.getCreatedAt());
        
        if (interest.getInnovator().getInnovatorProfile() != null) {
            dto.setInnovatorName(interest.getInnovator().getInnovatorProfile().getCompanyName());
            dto.setInnovatorLinkedinUrl(interest.getInnovator().getInnovatorProfile().getLinkedinUrl());
        } else {
            dto.setInnovatorName(interest.getInnovator().getEmail());
        }
        
        return dto;
    }

    private MandateDTO convertToDTO(Mandate mandate) {
        MandateDTO dto = new MandateDTO();
        dto.setId(mandate.getId());
        dto.setTitle(mandate.getTitle());
        dto.setDescription(mandate.getDescription());
        dto.setTargetIndustry(mandate.getTargetIndustry());
        dto.setStagePreference(mandate.getStagePreference());
        dto.setMinTicketSize(mandate.getMinTicketSize());
        dto.setMaxTicketSize(mandate.getMaxTicketSize());
        dto.setGeography(mandate.getGeography());
        dto.setCurrency(mandate.getCurrency());
        dto.setCreatedAt(mandate.getCreatedAt());
        dto.setInvestorId(mandate.getInvestor().getId());
        dto.setInvestorName(mandate.getInvestor().getEmail()); // Or add a name field to User later
        return dto;
    }
}
