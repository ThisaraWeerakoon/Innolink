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
}
