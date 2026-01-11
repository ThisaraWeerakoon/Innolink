package com.innovest.service;

import com.innovest.domain.*;
import com.innovest.repository.AccessRequestRepository;
import com.innovest.repository.ChatMessageRepository;
import com.innovest.repository.DealRepository;
import com.innovest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccessRequestRepository accessRequestRepository;

    @Transactional
    public ChatMessage sendMessage(UUID dealId, UUID senderId, UUID recipientId, String content) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User recipient = null;
        if (recipientId != null) {
            recipient = userRepository.findById(recipientId)
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));
        }

        // Verify Access
        verifyChatAccess(deal, sender);
        if (recipient != null) {
            verifyChatAccess(deal, recipient);
        }

        ChatMessage message = new ChatMessage();
        message.setDeal(deal);
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);

        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getMessages(UUID dealId, UUID userId, UUID otherUserId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        verifyChatAccess(deal, user);

        if (otherUserId != null) {
            return chatMessageRepository.findConversation(dealId, userId, otherUserId);
        } else {
            // Fallback for group chat or if no specific recipient requested (though UI
            // should drive this)
            return chatMessageRepository.findByDealIdOrderByCreatedAtAsc(dealId);
        }
    }

    private void verifyChatAccess(Deal deal, User user) {
        // 1. Innovator (Owner)
        if (deal.getInnovator().getId().equals(user.getId())) {
            return;
        }

        // 2. Investor with Interest Requested
        if (user.getRole() == UserRole.INVESTOR) {
            AccessRequest request = accessRequestRepository.findByDealIdAndInvestorId(deal.getId(), user.getId())
                    .orElseThrow(() -> new RuntimeException("Access request not found"));

            if (request.getStatus() == RequestStatus.APPROVED && request.isIntroRequested()) {
                return;
            }
        }

        throw new RuntimeException("Unauthorized: You do not have access to this chat.");
    }
}
