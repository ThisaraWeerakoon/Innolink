package com.innovest.controller;

import com.innovest.domain.User;

import com.innovest.dto.AuthResponse;
import com.innovest.dto.LoginRequest;
import com.innovest.dto.RegisterRequest;
import com.innovest.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import com.innovest.security.CustomUserDetails;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.register(registerRequest));
    }

    @GetMapping("/verify")
    public ResponseEntity<com.innovest.dto.UserDTO> verifyUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            return ResponseEntity.status(401).build();
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = authService.getUser(userDetails.getUser().getId());
        return ResponseEntity.ok(convertToDTO(user));
    }

    private com.innovest.dto.UserDTO convertToDTO(User user) {
        com.innovest.dto.UserDTO dto = new com.innovest.dto.UserDTO();
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
