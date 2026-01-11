package com.innovest.dto;

import lombok.Data;
import java.util.UUID;
import java.math.BigDecimal;
import java.util.List;

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
    private BigDecimal minTicketSize;
    private BigDecimal maxTicketSize;
    private List<String> interestedIndustries;

    // Manual Getters and Setters to resolve Lombok compilation issues
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getFundingStage() { return fundingStage; }
    public void setFundingStage(String fundingStage) { this.fundingStage = fundingStage; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public boolean isFeeAgreementSigned() { return feeAgreementSigned; }
    public void setFeeAgreementSigned(boolean feeAgreementSigned) { this.feeAgreementSigned = feeAgreementSigned; }

    public String getAccreditationDocUrl() { return accreditationDocUrl; }
    public void setAccreditationDocUrl(String accreditationDocUrl) { this.accreditationDocUrl = accreditationDocUrl; }

    public BigDecimal getMinTicketSize() { return minTicketSize; }
    public void setMinTicketSize(BigDecimal minTicketSize) { this.minTicketSize = minTicketSize; }

    public BigDecimal getMaxTicketSize() { return maxTicketSize; }
    public void setMaxTicketSize(BigDecimal maxTicketSize) { this.maxTicketSize = maxTicketSize; }

    public List<String> getInterestedIndustries() { return interestedIndustries; }
    public void setInterestedIndustries(List<String> interestedIndustries) { this.interestedIndustries = interestedIndustries; }
}
