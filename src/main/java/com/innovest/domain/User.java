package com.innovest.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "user_role")
    private UserRole role;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private InnovatorProfile innovatorProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private InvestorProfile investorProfile;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "user_saved_mandates",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "mandate_id")
    )
    private java.util.Set<Mandate> savedMandates = new java.util.HashSet<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "user_saved_deals",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "deal_id")
    )
    private java.util.Set<Deal> savedDeals = new java.util.HashSet<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public java.util.Set<Mandate> getSavedMandates() {
        return savedMandates;
    }

    public void setSavedMandates(java.util.Set<Mandate> savedMandates) {
        this.savedMandates = savedMandates;
    }

    public java.util.Set<Deal> getSavedDeals() {
        return savedDeals;
    }

    public void setSavedDeals(java.util.Set<Deal> savedDeals) {
        this.savedDeals = savedDeals;
    }

    public InnovatorProfile getInnovatorProfile() {
        return innovatorProfile;
    }

    public void setInnovatorProfile(InnovatorProfile innovatorProfile) {
        this.innovatorProfile = innovatorProfile;
    }

    public InvestorProfile getInvestorProfile() {
        return investorProfile;
    }

    public void setInvestorProfile(InvestorProfile investorProfile) {
        this.investorProfile = investorProfile;
    }
}
