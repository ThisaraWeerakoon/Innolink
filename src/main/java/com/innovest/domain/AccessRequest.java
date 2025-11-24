package com.innovest.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "access_requests")
@NoArgsConstructor
public class AccessRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "deal_id", nullable = false)
    private Deal deal;

    @ManyToOne
    @JoinColumn(name = "investor_id", nullable = false)
    private User investor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "nda_signed")
    private boolean ndaSigned = false;

    @Column(name = "nda_signed_at")
    private java.time.LocalDateTime ndaSignedAt;

    @Column(name = "intro_requested")
    private boolean introRequested = false;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Deal getDeal() {
        return deal;
    }

    public void setDeal(Deal deal) {
        this.deal = deal;
    }

    public User getInvestor() {
        return investor;
    }

    public void setInvestor(User investor) {
        this.investor = investor;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public boolean isNdaSigned() {
        return ndaSigned;
    }

    public void setNdaSigned(boolean ndaSigned) {
        this.ndaSigned = ndaSigned;
    }

    public boolean isIntroRequested() {
        return introRequested;
    }

    public void setIntroRequested(boolean introRequested) {
        this.introRequested = introRequested;
    }

    public java.time.LocalDateTime getNdaSignedAt() {
        return ndaSignedAt;
    }

    public void setNdaSignedAt(java.time.LocalDateTime ndaSignedAt) {
        this.ndaSignedAt = ndaSignedAt;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.time.LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(java.time.LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
