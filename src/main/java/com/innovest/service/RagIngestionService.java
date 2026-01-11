package com.innovest.service;

import com.innovest.domain.Deal;
import com.innovest.repository.DealRepository;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.net.URL;
import java.util.UUID;

@Service
public class RagIngestionService {

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private EmbeddingModel embeddingModel;

    @Autowired
    private EmbeddingStore<TextSegment> embeddingStore;

    @Autowired
    private StorageService storageService;

    @Async
    @Transactional
    public void ingestPitchDeck(UUID dealId, String blobUrl) {
        System.out.println("Starting RAG ingestion for Deal: " + dealId);
        try {
            // 1. Fetch the file content
            // We can download it using the blobUrl directly if it's public (SAS),
            // or use the StorageService to get the bytes.
            // Since `storageService.load` returns a Resource, we can use that.
            
            // However, the current StorageService implementation for Azure returns a UrlResource.
            // Let's rely on reading the stream from the URL for simplicity, assuming the URL is accessible.
            // If the URL is private, we might need to generate a SAS token or use the BlobClient directly.
            // For this implementation, we'll try to open the stream.
            
            // Check if we can use storageService.downloadFile(filename)
            // But we need the filename.
            
            String filename = blobUrl.substring(blobUrl.lastIndexOf("/") + 1);
            // If the blobUrl contains query params (SAS token), strip them for filename extraction
            if (filename.contains("?")) {
                filename = filename.substring(0, filename.indexOf("?"));
            }

            // Using downloadFile which returns byte[] might be memory heavy for large files.
            // But for pitch decks (<10MB), it's fine.
             byte[] fileData = storageService.downloadFile(filename);
             if (fileData == null) {
                 throw new RuntimeException("Could not download file: " + filename);
             }
            
             try (InputStream inputStream = new java.io.ByteArrayInputStream(fileData)) {
                 // 2. Parse PDF
                 ApachePdfBoxDocumentParser parser = new ApachePdfBoxDocumentParser();
                 Document document = parser.parse(inputStream);
                 
                 // Add metadata to the document so segments can be filtered by dealId later
                 document.metadata().put("dealId", dealId.toString());

                 // 3. Create Ingestor
                 EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                         .documentSplitter(DocumentSplitters.recursive(500, 50)) // 500 chars, 50 overlap
                         .embeddingModel(embeddingModel)
                         .embeddingStore(embeddingStore)
                         .build();

                 // 4. Ingest (Split -> Embed -> Store)
                 ingestor.ingest(document);
                 
                 System.out.println("RAG ingestion completed for Deal: " + dealId);
             }

        } catch (Exception e) {
            System.err.println("Error during RAG ingestion for Deal " + dealId + ": " + e.getMessage());
            e.printStackTrace();
            // TODO: Update deal status to indicate ingestion failure?
        }
    }
}
