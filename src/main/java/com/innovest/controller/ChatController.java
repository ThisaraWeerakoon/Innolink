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
        String content = (String) payload.get("content");

        return ResponseEntity.ok(chatService.sendMessage(dealId, senderId, content));
    }

    @org.springframework.messaging.handler.annotation.MessageMapping("/chat.sendMessage")
    @org.springframework.messaging.handler.annotation.SendTo("/topic/deal/{dealId}") // Dynamic topic not directly supported in SendTo annotation like this for path vars in standard way without destination variable, but let's check.
    // Actually @SendTo with dynamic path usually requires SimpMessagingTemplate if the destination depends on the message content dynamically in a complex way, 
    // OR we can use @DestinationVariable.
    // Let's use SimpMessagingTemplate for flexibility or fix the annotation usage.
    // Standard pattern: @MessageMapping("/chat/{dealId}/sendMessage") -> @SendTo("/topic/deal/{dealId}")
    public ChatMessage broadcastMessage(@org.springframework.messaging.handler.annotation.Payload Map<String, Object> payload) {
        UUID dealId = UUID.fromString((String) payload.get("dealId"));
        UUID senderId = UUID.fromString((String) payload.get("senderId"));
        String content = (String) payload.get("content");
        
        // We save it to DB first
        return chatService.sendMessage(dealId, senderId, content);
    }
    
    // Wait, @SendTo("/topic/deal/{dealId}") doesn't work with @Payload extraction directly for the topic name unless using @DestinationVariable.
    // Let's refine the approach.
    // Client sends to: /app/chat/{dealId}/sendMessage
    // Server broadcasts to: /topic/deal/{dealId}
    
    @org.springframework.messaging.handler.annotation.MessageMapping("/chat/{dealId}/sendMessage")
    @org.springframework.messaging.handler.annotation.SendTo("/topic/deal/{dealId}")
    public ChatMessage handleWebSocketMessage(@org.springframework.messaging.handler.annotation.DestinationVariable String dealId, @org.springframework.messaging.handler.annotation.Payload Map<String, Object> payload) {
        UUID dId = UUID.fromString(dealId);
        UUID senderId = UUID.fromString((String) payload.get("senderId"));
        String content = (String) payload.get("content");
        
        return chatService.sendMessage(dId, senderId, content);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@RequestParam UUID dealId, @RequestParam UUID userId) {
        return ResponseEntity.ok(chatService.getMessages(dealId, userId));
    }
}
