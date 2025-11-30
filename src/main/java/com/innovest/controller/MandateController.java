package com.innovest.controller;

import com.innovest.dto.MandateDTO;
import com.innovest.security.CustomUserDetails;
import com.innovest.service.MandateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/mandates")
@RequiredArgsConstructor
public class MandateController {

    private final MandateService mandateService;

    @GetMapping
    public ResponseEntity<List<MandateDTO>> getAllMandates(@RequestParam(required = false) String sortBy, @RequestParam(required = false) UUID investorId) {
        return ResponseEntity.ok(mandateService.getAllMandates(sortBy, investorId));
    }

    @PostMapping
    public ResponseEntity<MandateDTO> createMandate(@RequestBody MandateDTO mandateDTO, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(mandateService.createMandate(mandateDTO, userDetails.getId()));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<Void> saveMandate(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        mandateService.saveMandate(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unsaveMandate(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        mandateService.unsaveMandate(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/saved")
    public ResponseEntity<Set<MandateDTO>> getSavedMandates(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(mandateService.getSavedMandates(userDetails.getId()));
    }

    @PostMapping("/{id}/interest")
    public ResponseEntity<Void> expressInterest(@PathVariable UUID id, org.springframework.security.core.Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        mandateService.expressInterest(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/interest")
    public ResponseEntity<Boolean> checkInterest(@PathVariable UUID id, org.springframework.security.core.Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(mandateService.checkInterest(id, userDetails.getId()));
    }
}
