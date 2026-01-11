package com.innovest.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "deals")
@NoArgsConstructor
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "innovator_id", nullable = false)
    private User innovator;

    @Column(nullable = false)
    private String title;

    @Column(name = "teaser_summary", length = 1000)
    private String teaserSummary;

    @Column(name = "target_amount")
    private Double targetAmount;

    private String industry;

    @Column(name = "pitch_deck_filename")
    private String pitchDeckFilename;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealStatus status = DealStatus.DRAFT;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @OneToMany(mappedBy = "deal", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private java.util.List<DealDocument> documents;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getInnovator() {
        return innovator;
    }

    public void setInnovator(User innovator) {
        this.innovator = innovator;
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

    public String getPitchDeckFilename() {
        return pitchDeckFilename;
    }

    public void setPitchDeckFilename(String pitchDeckFilename) {
        this.pitchDeckFilename = pitchDeckFilename;
    }

    public DealStatus getStatus() {
        return status;
    }

    public void setStatus(DealStatus status) {
        this.status = status;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.time.LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(java.time.LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public java.util.List<DealDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(java.util.List<DealDocument> documents) {
        this.documents = documents;
    }
}
