package com.innovest.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MandateDTO {
    private UUID id;
    private String title;
    private String description;
    private String targetIndustry;
    private String stagePreference;
    private BigDecimal minTicketSize;
    private BigDecimal maxTicketSize;
    private String geography;
    private String currency;
    private LocalDateTime createdAt;
    private String investorName;
    private UUID investorId;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
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
    public String getInvestorName() { return investorName; }
    public void setInvestorName(String investorName) { this.investorName = investorName; }
    public UUID getInvestorId() { return investorId; }
    public void setInvestorId(UUID investorId) { this.investorId = investorId; }
}
