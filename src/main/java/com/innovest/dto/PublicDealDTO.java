package com.innovest.dto;

import com.innovest.domain.DealStatus;
import java.util.UUID;

public class PublicDealDTO {
    private UUID id;
    private String title;
    private String teaserSummary;
    private Double targetAmount;
    private String industry;
    private DealStatus status;
    private UserDTO innovator;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTeaserSummary() {
        return teaserSummary;
    }

    public void setTeaserSummary(String teaserSummary) {
        this.teaserSummary = teaserSummary;
    }

    public Double getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(Double targetAmount) {
        this.targetAmount = targetAmount;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public DealStatus getStatus() {
        return status;
    }

    public void setStatus(DealStatus status) {
        this.status = status;
    }

    public UserDTO getInnovator() {
        return innovator;
    }

    public void setInnovator(UserDTO innovator) {
        this.innovator = innovator;
    }
}
