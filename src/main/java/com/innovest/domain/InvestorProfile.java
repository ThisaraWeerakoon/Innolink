package com.innovest.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "investor_profiles")
@NoArgsConstructor
public class InvestorProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "accreditation_doc_url", columnDefinition = "TEXT")
    private String accreditationDocUrl;

    @Column(name = "min_ticket_size")
    private BigDecimal minTicketSize;

    @Column(name = "max_ticket_size")
    private BigDecimal maxTicketSize;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "investor_interested_industries", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "industry")
    private List<String> interestedIndustries;

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

    public String getAccreditationDocUrl() {
        return accreditationDocUrl;
    }

    public void setAccreditationDocUrl(String accreditationDocUrl) {
        this.accreditationDocUrl = accreditationDocUrl;
    }

    public BigDecimal getMinTicketSize() {
        return minTicketSize;
    }

    public void setMinTicketSize(BigDecimal minTicketSize) {
        this.minTicketSize = minTicketSize;
    }

    public BigDecimal getMaxTicketSize() {
        return maxTicketSize;
    }

    public void setMaxTicketSize(BigDecimal maxTicketSize) {
        this.maxTicketSize = maxTicketSize;
    }

    public List<String> getInterestedIndustries() {
        return interestedIndustries;
    }

    public void setInterestedIndustries(List<String> interestedIndustries) {
        this.interestedIndustries = interestedIndustries;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
