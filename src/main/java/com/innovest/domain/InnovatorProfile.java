package com.innovest.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "innovator_profiles")
@NoArgsConstructor
public class InnovatorProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String industry;

    @Column(name = "funding_stage")
    private String fundingStage;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "fee_agreement_signed", nullable = false)
    private boolean feeAgreementSigned = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getFundingStage() {
        return fundingStage;
    }

    public void setFundingStage(String fundingStage) {
        this.fundingStage = fundingStage;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public boolean isFeeAgreementSigned() {
        return feeAgreementSigned;
    }

    public void setFeeAgreementSigned(boolean feeAgreementSigned) {
        this.feeAgreementSigned = feeAgreementSigned;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
