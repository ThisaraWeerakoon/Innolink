package com.innovest.controller;

import com.innovest.domain.Deal;
import com.innovest.domain.DealDocument;
import com.innovest.dto.PrivateDealDTO;
import com.innovest.dto.PublicDealDTO;

import com.innovest.service.DealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class DealController {

    @Autowired
    private DealService dealService;

    @PostMapping("/innovator/deals")
    public ResponseEntity<Deal> createDeal(@RequestBody Deal deal, @RequestParam UUID userId) {
        return ResponseEntity.ok(dealService.createDeal(deal, userId));
    }

    @PostMapping("/innovator/deals/{id}/submit")
    public ResponseEntity<Deal> submitDeal(@PathVariable UUID id, @RequestParam UUID userId) {
        return ResponseEntity.ok(dealService.submitDealForApproval(id, userId));
    }

    @PostMapping("/innovator/deals/{id}/close")
    public ResponseEntity<Deal> closeDeal(@PathVariable UUID id, @RequestParam UUID userId) {
        return ResponseEntity.ok(dealService.closeDeal(id, userId));
    }

    @GetMapping("/innovator/deals")
    public ResponseEntity<List<Deal>> getDealsByInnovator(@RequestParam UUID userId) {
        return ResponseEntity.ok(dealService.getDealsByInnovator(userId));
    }

    @PostMapping("/innovator/deals/{id}/documents")
    public ResponseEntity<DealDocument> addDocument(@PathVariable UUID id, @RequestBody DealDocument document,
            @RequestParam UUID userId) {
        return ResponseEntity.ok(dealService.addDocumentToDeal(id, document, userId));
    }

    @GetMapping("/public/deals")
    public ResponseEntity<List<PublicDealDTO>> getPublicDeals() {
        return ResponseEntity.ok(dealService.getPublicDeals());
    }

    @GetMapping("/deals/{id}/full_details")
    public ResponseEntity<PrivateDealDTO> getPrivateDeal(@PathVariable UUID id, @RequestParam UUID userId) {
        return ResponseEntity.ok(dealService.getPrivateDeal(id, userId));
    }

    @GetMapping("/deals")
    public ResponseEntity<List<com.innovest.dto.DealDTO>> getAllActiveDeals(
            @RequestParam(required = false) String sortBy, @RequestParam(required = false) UUID innovatorId) {
        return ResponseEntity.ok(dealService.getAllActiveDeals(sortBy, innovatorId));
    }

    @PostMapping("/deals/{id}/save")
    public ResponseEntity<Void> saveDeal(@PathVariable UUID id,
            org.springframework.security.core.Authentication authentication) {
        com.innovest.security.CustomUserDetails userDetails = (com.innovest.security.CustomUserDetails) authentication
                .getPrincipal();
        dealService.saveDeal(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/deals/{id}/save")
    public ResponseEntity<Void> unsaveDeal(@PathVariable UUID id,
            org.springframework.security.core.Authentication authentication) {
        com.innovest.security.CustomUserDetails userDetails = (com.innovest.security.CustomUserDetails) authentication
                .getPrincipal();
        dealService.unsaveDeal(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/deals/saved")
    public ResponseEntity<java.util.Set<com.innovest.dto.DealDTO>> getSavedDeals(
            org.springframework.security.core.Authentication authentication) {
        com.innovest.security.CustomUserDetails userDetails = (com.innovest.security.CustomUserDetails) authentication
                .getPrincipal();
        return ResponseEntity.ok(dealService.getSavedDeals(userDetails.getId()));
    }
    @Autowired
    private com.innovest.service.RagSearchService ragSearchService;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(DealController.class);

    @PostMapping("/deals/{id}/pitch-deck")
    public ResponseEntity<Void> uploadPitchDeck(@PathVariable UUID id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        logger.info("Received Pitch Deck upload request for Deal ID: {}", id);
        logger.info("File Size: {}", file.getSize());
        dealService.uploadPitchDeck(id, file);
        logger.info("Pitch Deck upload processing handed off to service.");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/deals/search")
    public ResponseEntity<List<String>> searchDeals(@RequestParam String query, @RequestParam(required = false) UUID dealId) {
        // Default max results to 5
        return ResponseEntity.ok(ragSearchService.search(query, dealId, 5));
    }
}
