package com.innovest.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "investor_profiles")
@Data
@NoArgsConstructor
public class InvestorProfile {

    @Id
    private java.util.UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "accreditation_doc_url")
    private String accreditationDocUrl;

    @Column(name = "min_ticket_size")
    private Double minTicketSize;

    @Column(name = "max_ticket_size")
    private Double maxTicketSize;

    @ElementCollection
    @CollectionTable(name = "investor_industries", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "industry")
    private List<String> interestedIndustries;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;
}
