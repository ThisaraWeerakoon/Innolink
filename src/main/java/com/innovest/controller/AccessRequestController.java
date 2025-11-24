package com.innovest.controller;

import com.innovest.domain.AccessRequest;
import com.innovest.security.CustomUserDetails;
import com.innovest.service.AccessRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AccessRequestController {

    @Autowired
    private AccessRequestService accessRequestService;

    @PostMapping("/deals/{id}/request")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<AccessRequest> requestAccess(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(accessRequestService.requestAccess(id, currentUser.getId()));
    }

    @PutMapping("/innovator/requests/{id}")
    @PreAuthorize("hasRole('INNOVATOR')")
    public ResponseEntity<AccessRequest> approveRequest(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(accessRequestService.approveRequest(id, currentUser.getId()));
    }

    @PostMapping("/investor/requests/{id}/sign-nda")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<AccessRequest> signNda(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(accessRequestService.signNda(id, currentUser.getId()));
    }
}
