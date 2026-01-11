package com.innovest.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mandates")
@Data
@NoArgsConstructor
public class Mandate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "investor_id", nullable = false)
    private User investor;

    @Column(nullable = true)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(name = "target_industry")
    private String targetIndustry;

    @Column(name = "stage_preference")
    private String stagePreference;

    @Column(name = "min_ticket_size")
    private BigDecimal minTicketSize;

    @Column(name = "max_ticket_size")
    private BigDecimal maxTicketSize;

    private String geography;

    private String currency = "USD";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Manual Getters/Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getInvestor() { return investor; }
    public void setInvestor(User investor) { this.investor = investor; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTargetIndustry() { return targetIndustry; }
    public void setTargetIndustry(String targetIndustry) { this.targetIndustry = targetIndustry; }
    public String getStagePreference() { return stagePreference; }
    public void setStagePreference(String stagePreference) { this.stagePreference = stagePreference; }
    public BigDecimal getMinTicketSize() { return minTicketSize; }
    public void setMinTicketSize(BigDecimal minTicketSize) { this.minTicketSize = minTicketSize; }
    public BigDecimal getMaxTicketSize() { return maxTicketSize; }
    public void setMaxTicketSize(BigDecimal maxTicketSize) { this.maxTicketSize = maxTicketSize; }
    public String getGeography() { return geography; }
    public void setGeography(String geography) { this.geography = geography; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
