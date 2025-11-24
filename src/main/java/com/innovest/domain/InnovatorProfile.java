package com.innovest.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "innovator_profiles")
@Data
@NoArgsConstructor
public class InnovatorProfile {

    @Id
    private java.util.UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "company_name")
    private String companyName;

    private String industry;

    @Column(name = "funding_stage")
    private String fundingStage;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "fee_agreement_signed")
    private boolean feeAgreementSigned = false;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;
}
