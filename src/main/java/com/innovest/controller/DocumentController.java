package com.innovest.controller;

import com.innovest.domain.DealDocument;
import com.innovest.repository.DealDocumentRepository;

import com.innovest.service.DealService;
import com.innovest.service.PdfWatermarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private PdfWatermarkService pdfWatermarkService;

    @Autowired
    private DealDocumentRepository dealDocumentRepository;

    @Autowired
    private DealService dealService;

    @Autowired
    private com.innovest.repository.UserRepository userRepository;

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable UUID id, @RequestParam UUID userId) {
        try {
            DealDocument document = dealDocumentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Verify access using DealService logic (reusing the private deal access check)
            dealService.getPrivateDeal(document.getDeal().getId(), userId);
            
            com.innovest.domain.User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            InputStream fileStream;
            if ("mock".equals(document.getFileUrl())) {
                 throw new RuntimeException("Mock file download not fully implemented for demo without real files.");
            } else {
                 fileStream = new URL(document.getFileUrl()).openStream();
            }

            byte[] watermarkedPdf = pdfWatermarkService.watermarkPdf(fileStream, user.getEmail());
            ByteArrayResource resource = new ByteArrayResource(watermarkedPdf);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + id + ".pdf\"")
                    .contentLength(watermarkedPdf.length)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
