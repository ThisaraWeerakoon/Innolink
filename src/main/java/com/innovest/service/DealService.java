package com.innovest.service;

import com.innovest.domain.*;
import com.innovest.dto.*;
import com.innovest.repository.AccessRequestRepository;
import com.innovest.repository.DealDocumentRepository;
import com.innovest.repository.DealRepository;
import com.innovest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DealService {

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private DealDocumentRepository dealDocumentRepository;

    @Autowired
    private AccessRequestRepository accessRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DealMapper dealMapper;

    @Transactional
    public Deal createDeal(Deal deal, UUID innovatorId) {
        User innovator = userRepository.findById(innovatorId)
                .orElseThrow(() -> new RuntimeException("Innovator not found"));
        deal.setInnovator(innovator);

        // Default to DRAFT if not specified
        if (deal.getStatus() == null) {
            deal.setStatus(DealStatus.DRAFT);
        }

        // If trying to publish immediately, check verification
        if (deal.getStatus() == DealStatus.PENDING_APPROVAL) {
            if (!innovator.isVerified()) {
                throw new RuntimeException("You must be a verified innovator to publish deals.");
            }
        } else {
            // Force DRAFT for any other status during creation if not explicitly handled
            deal.setStatus(DealStatus.DRAFT);
        }

        return dealRepository.save(deal);
    }

    @Transactional
    public Deal submitDealForApproval(UUID dealId, UUID userId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getInnovator().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You are not the owner of this deal");
        }

        if (!deal.getInnovator().isVerified()) {
            throw new RuntimeException("You must be a verified innovator to submit deals for approval.");
        }

        if (deal.getStatus() != DealStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT deals can be submitted for approval");
        }

        deal.setStatus(DealStatus.PENDING_APPROVAL);
        return dealRepository.save(deal);
    }

    public List<Deal> getPendingDeals() {
        return dealRepository.findByStatus(DealStatus.PENDING_APPROVAL);
    }

    @Transactional
    public Deal approveDeal(UUID dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        deal.setStatus(DealStatus.ACTIVE);
        return dealRepository.save(deal);
    }

    @Transactional
    public Deal rejectDeal(UUID dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        deal.setStatus(DealStatus.REJECTED);
        return dealRepository.save(deal);
    }

    @Transactional
    public Deal closeDeal(UUID dealId, UUID innovatorId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getInnovator().getId().equals(innovatorId)) {
            throw new RuntimeException("Unauthorized: You are not the owner of this deal");
        }

        if (deal.getStatus() != DealStatus.ACTIVE) {
            throw new RuntimeException("Only ACTIVE deals can be closed");
        }

        deal.setStatus(DealStatus.CLOSED);
        deal.setUpdatedAt(java.time.LocalDateTime.now());
        return dealRepository.save(deal);
    }

    @Transactional
    public DealDocument addDocumentToDeal(UUID dealId, DealDocument document, UUID userId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getInnovator().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You are not the owner of this deal");
        }

        document.setDeal(deal);
        document.setCreatedAt(java.time.LocalDateTime.now());
        return dealDocumentRepository.save(document);
    }

    public List<PublicDealDTO> getPublicDeals() {
        return dealRepository.findByStatus(DealStatus.ACTIVE).stream()
                .map(dealMapper::toPublicDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Deal> getDealsByInnovator(UUID innovatorId) {
        return dealRepository.findByInnovatorId(innovatorId);
    }

    @Transactional(readOnly = true)
    public PrivateDealDTO getPrivateDeal(UUID dealId, UUID userId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean hasAccess = false;

        // 1. Owner (Innovator)
        if (deal.getInnovator().getId().equals(userId)) {
            hasAccess = true;
        }
        // 2. Investor with APPROVED request and SIGNED NDA
        else if (user.getRole() == UserRole.INVESTOR) {
            AccessRequest request = accessRequestRepository.findByDealIdAndInvestorId(dealId, userId)
                    .orElse(null);

            if (request != null && request.getStatus() == RequestStatus.APPROVED && request.isNdaSigned()) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            throw new RuntimeException("You do not have access to this deal's private details.");
        }

        List<DealDocument> documents = dealDocumentRepository.findByDealId(dealId);
        List<DealDocumentDTO> documentDTOs = documents.stream()
                .map(dealMapper::toDocumentDto)
                .collect(Collectors.toList());

        return dealMapper.toPrivateDto(deal, documentDTOs);
    }

    public List<DealDTO> getAllActiveDeals(String sortBy, UUID innovatorId) {
        List<Deal> deals;
        if (innovatorId != null) {
            deals = dealRepository.findByInnovatorIdAndStatus(innovatorId, DealStatus.ACTIVE);
        } else if ("recent".equals(sortBy)) {
            deals = dealRepository.findAll(org.springframework.data.domain.Sort
                    .by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        } else {
            deals = dealRepository.findAll();
        }

        return deals.stream()
                .filter(deal -> {
                    if (deal.getStatus() == DealStatus.ACTIVE) {
                        return true;
                    }
                    if (deal.getStatus() == DealStatus.CLOSED) {
                        return deal.getUpdatedAt() != null &&
                                deal.getUpdatedAt().isAfter(java.time.LocalDateTime.now().minusHours(24));
                    }
                    return false;
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveDeal(UUID userId, UUID dealId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        user.getSavedDeals().add(deal);
        userRepository.save(user);
    }

    @Transactional
    public void unsaveDeal(UUID userId, UUID dealId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        user.getSavedDeals().remove(deal);
        userRepository.save(user);
    }

    public java.util.Set<DealDTO> getSavedDeals(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getSavedDeals().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toSet());
    }

    @Autowired
    private StorageService storageService;

    @Autowired
    private RagIngestionService ragIngestionService;

    @Transactional
    public void uploadPitchDeck(UUID dealId, org.springframework.web.multipart.MultipartFile file, boolean isPrivate) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        String filename = storageService.uploadFile(file, "pitch-decks");
        deal.setPitchDeckFilename(filename);
        dealRepository.save(deal);

        // Create DealDocument entry so it appears in the frontend list
        DealDocument doc = new DealDocument();
        doc.setDeal(deal);
        doc.setFileUrl(filename);
        doc.setFileType(DocType.PITCH_DECK);
        doc.setPrivate(isPrivate);
        doc.setCreatedAt(java.time.LocalDateTime.now());
        dealDocumentRepository.save(doc);

        // Trigger RAG Ingestion asynchronously
        ragIngestionService.ingestPitchDeck(dealId, filename);
    }

    private DealDTO convertToDTO(Deal deal) {
        DealDTO dto = new DealDTO();
        dto.setId(deal.getId());
        dto.setTitle(deal.getTitle());
        dto.setTeaserSummary(deal.getTeaserSummary());
        dto.setTargetAmount(deal.getTargetAmount());
        dto.setIndustry(deal.getIndustry());
        dto.setStatus(deal.getStatus());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setInnovatorId(deal.getInnovator().getId());
        if (deal.getInnovator().getInnovatorProfile() != null) {
            dto.setInnovatorName(deal.getInnovator().getInnovatorProfile().getCompanyName());
        } else {
            dto.setInnovatorName(deal.getInnovator().getEmail());
        }
        if (deal.getDocuments() != null) {
            dto.setDocuments(deal.getDocuments().stream()
                    .map(dealMapper::toDocumentDto)
                    .collect(Collectors.toList()));
        }
        // Add pitch deck filename to DTO if needed, but purely optional based on request.
        // User didn't ask to return it in DTO, just save it.
        return dto;
    }
}
