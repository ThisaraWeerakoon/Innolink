package com.innovest.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mandate_interests")
@Data
@NoArgsConstructor
public class MandateInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "mandate_id", nullable = false)
    private Mandate mandate;

    @ManyToOne
    @JoinColumn(name = "innovator_id", nullable = false)
    private User innovator;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, VIEWED, CONTACTED, REJECTED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
