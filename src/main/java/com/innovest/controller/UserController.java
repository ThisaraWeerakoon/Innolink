package com.innovest.controller;

import com.innovest.domain.User;
import com.innovest.dto.UserDTO;
import com.innovest.repository.UserRepository;
import com.innovest.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.innovest.repository.InnovatorProfileRepository innovatorProfileRepository;

    @Autowired
    private com.innovest.repository.InvestorProfileRepository investorProfileRepository;

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@RequestBody UserDTO userDTO, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == com.innovest.domain.UserRole.INNOVATOR) {
            com.innovest.domain.InnovatorProfile profile = user.getInnovatorProfile();
            if (profile == null) {
                profile = new com.innovest.domain.InnovatorProfile();
                profile.setUser(user);
            }
            profile.setCompanyName(userDTO.getCompanyName());
            profile.setIndustry(userDTO.getIndustry());
            profile.setFundingStage(userDTO.getFundingStage());
            profile.setLinkedinUrl(userDTO.getLinkedinUrl());
            // feeAgreementSigned is usually handled separately or by admin, but allowing update here for simplicity if needed
            // profile.setFeeAgreementSigned(userDTO.isFeeAgreementSigned()); 
            
            innovatorProfileRepository.save(profile);
            user.setInnovatorProfile(profile);
        } else if (user.getRole() == com.innovest.domain.UserRole.INVESTOR) {
            com.innovest.domain.InvestorProfile profile = user.getInvestorProfile();
            if (profile == null) {
                profile = new com.innovest.domain.InvestorProfile();
                profile.setUser(user);
            }
            profile.setMinTicketSize(userDTO.getMinTicketSize());
            profile.setMaxTicketSize(userDTO.getMaxTicketSize());
            profile.setInterestedIndustries(userDTO.getInterestedIndustries());
            // accreditationDocUrl handled via file upload usually
            profile.setAccreditationDocUrl(userDTO.getAccreditationDocUrl());

            investorProfileRepository.save(profile);
            user.setInvestorProfile(profile);
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(convertToDTO(updatedUser));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(convertToDTO(user));
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setVerified(user.isVerified());

        if (user.getRole() == com.innovest.domain.UserRole.INNOVATOR && user.getInnovatorProfile() != null) {
            com.innovest.domain.InnovatorProfile profile = user.getInnovatorProfile();
            dto.setCompanyName(profile.getCompanyName());
            dto.setIndustry(profile.getIndustry());
            dto.setFundingStage(profile.getFundingStage());
            dto.setLinkedinUrl(profile.getLinkedinUrl());
            dto.setFeeAgreementSigned(profile.isFeeAgreementSigned());
        } else if (user.getRole() == com.innovest.domain.UserRole.INVESTOR && user.getInvestorProfile() != null) {
            com.innovest.domain.InvestorProfile profile = user.getInvestorProfile();
            dto.setMinTicketSize(profile.getMinTicketSize());
            dto.setMaxTicketSize(profile.getMaxTicketSize());
            dto.setInterestedIndustries(profile.getInterestedIndustries());
            dto.setAccreditationDocUrl(profile.getAccreditationDocUrl());
        }
        return dto;
    }
}
