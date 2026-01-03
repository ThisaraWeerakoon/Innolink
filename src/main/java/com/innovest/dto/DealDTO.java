package com.innovest.dto;

import com.innovest.domain.DealStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Data
public class DealDTO {
    private UUID id;
    private String title;
    private String teaserSummary;
    private Double targetAmount;
    private String industry;
    private DealStatus status;
    private LocalDateTime createdAt;
    private String innovatorName;
    private UUID innovatorId;
    private List<DealDocumentDTO> documents;

    // Manual Getters/Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTeaserSummary() { return teaserSummary; }
    public void setTeaserSummary(String teaserSummary) { this.teaserSummary = teaserSummary; }
    public Double getTargetAmount() { return targetAmount; }
    public void setTargetAmount(Double targetAmount) { this.targetAmount = targetAmount; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public DealStatus getStatus() { return status; }
    public void setStatus(DealStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getInnovatorName() { return innovatorName; }
    public void setInnovatorName(String innovatorName) { this.innovatorName = innovatorName; }
    public UUID getInnovatorId() { return innovatorId; }
    public void setInnovatorId(UUID innovatorId) { this.innovatorId = innovatorId; }
    public List<DealDocumentDTO> getDocuments() { return documents; }
    public void setDocuments(List<DealDocumentDTO> documents) { this.documents = documents; }
}
