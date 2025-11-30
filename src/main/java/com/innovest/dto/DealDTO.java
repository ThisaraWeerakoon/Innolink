package com.innovest.dto;

import com.innovest.domain.DealStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

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
}
