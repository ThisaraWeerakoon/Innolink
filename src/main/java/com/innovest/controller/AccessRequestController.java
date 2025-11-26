package com.innovest.controller;

import com.innovest.domain.AccessRequest;

import com.innovest.service.AccessRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AccessRequestController {

    @Autowired
    private AccessRequestService accessRequestService;

    @PostMapping("/deals/{id}/request")
    public ResponseEntity<AccessRequest> requestAccess(@PathVariable UUID id, @RequestParam UUID userId) {
        return ResponseEntity.ok(accessRequestService.requestAccess(id, userId));
    }

    @PutMapping("/innovator/requests/{id}")
    public ResponseEntity<AccessRequest> approveRequest(@PathVariable UUID id, @RequestParam UUID userId) {
        return ResponseEntity.ok(accessRequestService.approveRequest(id, userId));
    }

    @PostMapping("/investor/requests/{id}/sign-nda")
    public ResponseEntity<AccessRequest> signNda(@PathVariable UUID id, @RequestParam UUID userId) {
        return ResponseEntity.ok(accessRequestService.signNda(id, userId));
    }
    @GetMapping("/access/status/{dealId}")
    public ResponseEntity<AccessRequest> getAccessStatus(@PathVariable UUID dealId, @RequestParam UUID userId) {
        return ResponseEntity.ok(accessRequestService.getAccessRequest(dealId, userId));
    }

    @GetMapping("/innovator/requests")
    public ResponseEntity<java.util.List<AccessRequest>> getRequestsByInnovator(@RequestParam UUID userId) {
        return ResponseEntity.ok(accessRequestService.getRequestsByInnovator(userId));
    }
}
