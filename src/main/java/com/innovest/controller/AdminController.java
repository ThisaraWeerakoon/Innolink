package com.innovest.controller;

import com.innovest.domain.Deal;
import com.innovest.domain.User;
import com.innovest.service.DealService;
import com.innovest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private DealService dealService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    @PutMapping("/verify/{id}")
    public ResponseEntity<User> verifyUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.verifyUser(id));
    }

    @GetMapping("/deals/pending")
    public ResponseEntity<List<Deal>> getPendingDeals() {
        return ResponseEntity.ok(dealService.getPendingDeals());
    }

    @PutMapping("/deals/{id}/approve")
    public ResponseEntity<Deal> approveDeal(@PathVariable UUID id) {
        return ResponseEntity.ok(dealService.approveDeal(id));
    }

    @PutMapping("/deals/{id}/reject")
    public ResponseEntity<Deal> rejectDeal(@PathVariable UUID id) {
        return ResponseEntity.ok(dealService.rejectDeal(id));
    }
}
