package com.innovest.controller;

import com.innovest.domain.Deal;
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

    @GetMapping("/public/deals")
    public ResponseEntity<List<PublicDealDTO>> getPublicDeals() {
        return ResponseEntity.ok(dealService.getPublicDeals());
    }

    @GetMapping("/deals/{id}/full_details")
    public ResponseEntity<PrivateDealDTO> getPrivateDeal(@PathVariable UUID id, @RequestParam UUID userId) {
        return ResponseEntity.ok(dealService.getPrivateDeal(id, userId));
    }
}
