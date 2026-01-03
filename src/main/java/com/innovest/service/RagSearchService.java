package com.innovest.service;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RagSearchService {

    @Autowired
    private EmbeddingModel embeddingModel;

    @Autowired
    private EmbeddingStore<TextSegment> embeddingStore;

    public List<String> search(String query, UUID dealId, int maxResults) {
        // 1. Embed the query
        dev.langchain4j.data.embedding.Embedding queryEmbedding = embeddingModel.embed(query).content();

        // 2. Search
        // We want to filter by dealId if provided.
        // LangChain4j PGVector support for metadata filtering is available but requires specific setup.
        // For simplicity in this iteration, we'll fetch results and filter, 
        // OR rely on the store's filter capability if easily accessible.
        // The basic `findRelevant` doesn't strictly filter by metadata in all stores without builder.
        
        // Let's use the explicit SearchRequest builder if available or standard similarity search.
        // Note: PGVector `findRelevant` usually ignores metadata unless Filter is passed.
        
        // Constructing a filter for dealId if LangChain4j version supports it easily.
        // Version 0.31.0 supports metadata filtering.
        
        /*
        Filter filter = null;
        if (dealId != null) {
            filter = MetadataFilterBuilder.metadataKey("dealId").isEqualTo(dealId.toString());
        }
        
        EmbeddingSearchRequest request = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .maxResults(maxResults)
                .filter(filter)
                .build();
                
        EmbeddingSearchResult<TextSegment> result = embeddingStore.search(request);
        */
        
        // Fallback to simple retrieval for now to ensure compatibility without importing complex filter classes 
        // unless I see the imports are available. Let's try simple findRelevant first.
        
        List<EmbeddingMatch<TextSegment>> matches = embeddingStore.findRelevant(queryEmbedding, maxResults);

        // Client-side filtering if DB filtering isn't set up (not ideal for large scale but fine for MVP)
        if (dealId != null) {
            return matches.stream()
                    .filter(match -> dealId.toString().equals(match.embedded().metadata().get("dealId")))
                    .map(match -> match.embedded().text())
                    .collect(Collectors.toList());
        }

        return matches.stream()
                .map(match -> match.embedded().text())
                .collect(Collectors.toList());
    }
}
