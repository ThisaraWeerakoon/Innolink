package com.innovest.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MandateInterestDTO {
    private UUID id;
    private UUID mandateId;
    private UUID innovatorId;
    private String innovatorName; // Company Name
    private String innovatorEmail;
    private String innovatorLinkedinUrl;
    private String status;
    private LocalDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getMandateId() { return mandateId; }
    public void setMandateId(UUID mandateId) { this.mandateId = mandateId; }
    public UUID getInnovatorId() { return innovatorId; }
    public void setInnovatorId(UUID innovatorId) { this.innovatorId = innovatorId; }
    public String getInnovatorName() { return innovatorName; }
    public void setInnovatorName(String innovatorName) { this.innovatorName = innovatorName; }
    public String getInnovatorEmail() { return innovatorEmail; }
    public void setInnovatorEmail(String innovatorEmail) { this.innovatorEmail = innovatorEmail; }
    public String getInnovatorLinkedinUrl() { return innovatorLinkedinUrl; }
    public void setInnovatorLinkedinUrl(String innovatorLinkedinUrl) { this.innovatorLinkedinUrl = innovatorLinkedinUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
