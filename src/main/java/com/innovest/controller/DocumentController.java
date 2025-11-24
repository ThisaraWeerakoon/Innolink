package com.innovest.controller;

import com.innovest.domain.DealDocument;
import com.innovest.repository.DealDocumentRepository;
import com.innovest.security.CustomUserDetails;
import com.innovest.service.DealService;
import com.innovest.service.PdfWatermarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('INNOVATOR', 'INVESTOR')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails currentUser) throws IOException {
        DealDocument document = dealDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Verify access using DealService logic (reusing the private deal access check)
        // This ensures the user has access to the deal before downloading documents
        dealService.getPrivateDeal(document.getDeal().getId(), currentUser);

        // In a real app, fileUrl would be a path to S3 or local storage.
        // For this example, we'll assume it's a valid URL or handle it as a mock.
        // Since we don't have real files, I'll create a dummy PDF in memory if the URL is "mock".
        
        InputStream fileStream;
        if ("mock".equals(document.getFileUrl())) {
             // Create a simple PDF in memory for testing would be complex here without more deps or code.
             // Instead, let's assume the fileUrl is a valid URL to a PDF or a local path.
             // For safety in this environment, I will just return a text file masquerading as PDF if it's mock, 
             // but the requirement is to use PDFBox.
             // Let's assume the user will provide a valid URL or we just fail if not found.
             throw new RuntimeException("Mock file download not fully implemented for demo without real files.");
        } else {
             fileStream = new URL(document.getFileUrl()).openStream();
        }

        byte[] watermarkedPdf = pdfWatermarkService.watermarkPdf(fileStream, currentUser.getEmail());
        ByteArrayResource resource = new ByteArrayResource(watermarkedPdf);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + id + ".pdf\"")
                .contentLength(watermarkedPdf.length)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
