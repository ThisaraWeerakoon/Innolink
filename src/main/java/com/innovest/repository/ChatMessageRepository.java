package com.innovest.repository;

import com.innovest.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByDealIdOrderByCreatedAtAsc(UUID dealId);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM ChatMessage m WHERE m.deal.id = :dealId AND ((m.sender.id = :user1Id AND m.recipient.id = :user2Id) OR (m.sender.id = :user2Id AND m.recipient.id = :user1Id)) ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversation(@org.springframework.data.repository.query.Param("dealId") UUID dealId,
            @org.springframework.data.repository.query.Param("user1Id") UUID user1Id,
            @org.springframework.data.repository.query.Param("user2Id") UUID user2Id);
}
