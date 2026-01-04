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
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

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
    public ResponseEntity<Void> uploadPitchDeck(@PathVariable UUID id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file, @RequestParam(value = "isPrivate", defaultValue = "true") boolean isPrivate) {
        logger.info("Received Pitch Deck upload request for Deal ID: {}", id);
        logger.info("File Size: {}", file.getSize());
        dealService.uploadPitchDeck(id, file, isPrivate);
        logger.info("Pitch Deck upload processing handed off to service.");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/deals/search")
    public ResponseEntity<List<String>> searchDeals(@RequestParam String query, @RequestParam(required = false) UUID dealId) {
        // Default max results to 5
        return ResponseEntity.ok(ragSearchService.search(query, dealId, 5));
    }
    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/debug/embeddings")
    public ResponseEntity<String> getEmbeddings() {
        // Native query to fetch text, metadata AND the vector embedding
        List<Object[]> results = entityManager.createNativeQuery(
            "SELECT cast(embedding_id as varchar), text, cast(metadata as varchar), cast(embedding as varchar) FROM embeddings LIMIT 20"
        ).getResultList();

        StringBuilder html = new StringBuilder();
        html.append("<html><head><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; } th { background-color: #f2f2f2; } .vector { font-family: monospace; font-size: 10px; word-break: break-all; max-width: 400px; }</style></head><body>");
        html.append("<h2>Vector Database Contents (Top 20)</h2>");
        html.append("<table>");
        html.append("<tr><th>ID</th><th>Text Content</th><th>Metadata</th><th>Vector Embedding</th></tr>");

        for (Object[] row : results) {
            html.append("<tr>");
            html.append("<td>").append(row[0]).append("</td>"); // ID
            html.append("<td>").append(row[1]).append("</td>"); // Text
            html.append("<td>").append(row[2]).append("</td>"); // Metadata
            html.append("<td class='vector'>").append(row[3]).append("</td>"); // Vector
            html.append("</tr>");
        }
        html.append("</table></body></html>");

        return ResponseEntity.ok().contentType(org.springframework.http.MediaType.TEXT_HTML).body(html.toString());
    }
}
