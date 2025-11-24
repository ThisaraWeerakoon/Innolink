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

    @Column(nullable = false)
    private String description;

    @Column(name = "amount_allocation")
    private BigDecimal amountAllocation;

    @Column(name = "target_industry")
    private String targetIndustry;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
