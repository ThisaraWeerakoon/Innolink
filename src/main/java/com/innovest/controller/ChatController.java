package com.innovest.controller;

import com.innovest.domain.ChatMessage;
import com.innovest.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody Map<String, Object> payload) {
        UUID dealId = UUID.fromString((String) payload.get("dealId"));
        UUID senderId = UUID.fromString((String) payload.get("senderId"));
        String recipientIdStr = (String) payload.get("recipientId");
        UUID recipientId = recipientIdStr != null ? UUID.fromString(recipientIdStr) : null;
        String content = (String) payload.get("content");

        return ResponseEntity.ok(chatService.sendMessage(dealId, senderId, recipientId, content));
    }

    @org.springframework.messaging.handler.annotation.MessageMapping("/chat/{dealId}/sendMessage")
    @org.springframework.messaging.handler.annotation.SendTo("/topic/deal/{dealId}")
    public ChatMessage handleWebSocketMessage(
            @org.springframework.messaging.handler.annotation.DestinationVariable String dealId,
            @org.springframework.messaging.handler.annotation.Payload Map<String, Object> payload) {
        UUID dId = UUID.fromString(dealId);
        UUID senderId = UUID.fromString((String) payload.get("senderId"));
        String recipientIdStr = (String) payload.get("recipientId");
        UUID recipientId = recipientIdStr != null ? UUID.fromString(recipientIdStr) : null;
        String content = (String) payload.get("content");

        return chatService.sendMessage(dId, senderId, recipientId, content);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@RequestParam UUID dealId, @RequestParam UUID userId,
            @RequestParam(required = false) UUID recipientId) {
        return ResponseEntity.ok(chatService.getMessages(dealId, userId, recipientId));
    }
}
