package com.innovest.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserDTO {
    private UUID id;
    private String email;
    private String role;
    private boolean isVerified;

    // Innovator Profile Fields
    private String companyName;
    private String industry;
    private String fundingStage;
    private String linkedinUrl;
    private boolean feeAgreementSigned;

    // Investor Profile Fields
    private String accreditationDocUrl;
    private java.math.BigDecimal minTicketSize;
    private java.math.BigDecimal maxTicketSize;
    private java.util.List<String> interestedIndustries;
}
