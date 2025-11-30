package com.innovest.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MandateDTO {
    private UUID id;
    private String description;
    private BigDecimal amountAllocation;
    private String targetIndustry;
    private LocalDateTime createdAt;
    private String investorName;
    private UUID investorId;
}
