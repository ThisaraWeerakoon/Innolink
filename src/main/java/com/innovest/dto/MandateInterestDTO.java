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
}
