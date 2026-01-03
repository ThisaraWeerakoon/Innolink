package com.innovest.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.AllMiniLmL6V2QuantizedEmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RagConfiguration {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${spring.datasource.username}")
    private String databaseUser;

    @Value("${spring.datasource.password}")
    private String databasePassword;

    @Bean
    public EmbeddingModel embeddingModel() {
        // Creates an in-process embedding model (AllMiniLmL6V2)
        // It requires no API key and runs locally.
        // It produces embeddings with 384 dimensions.
        return new AllMiniLmL6V2QuantizedEmbeddingModel();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        // Clean up the JDBC URL to get just the host, port, and database
        // Expected format: jdbc:postgresql://host:port/database
        // PgVectorEmbeddingStore builder needs explicit host, port, db, user, pass

        // For simplicity in this demo, we assume the standard format.
        // A more robust production setup would parse this carefully or use separate properties.
        
        String host = "localhost";
        int port = 5432;
        String database = "innolink";
        
        try {
            String cleanUrl = databaseUrl.replace("jdbc:postgresql://", "");
            int slashIndex = cleanUrl.indexOf("/");
            String hostPort = cleanUrl.substring(0, slashIndex);
            database = cleanUrl.substring(slashIndex + 1);
            
            // Remove params if any
            if (database.contains("?")) {
                database = database.substring(0, database.indexOf("?"));
            }

            String[] hostPortSplit = hostPort.split(":");
            host = hostPortSplit[0];
            if (hostPortSplit.length > 1) {
                port = Integer.parseInt(hostPortSplit[1]);
            }
        } catch (Exception e) {
             System.err.println("Failed to parse DB URL for PGVector: " + e.getMessage());
             // Fallback or explicit failure
        }

        return PgVectorEmbeddingStore.builder()
                .host(host)
                .port(port)
                .database(database)
                .user(databaseUser)
                .password(databasePassword)
                .table("embeddings")
                .dimension(384) // Matches AllMiniLmL6V2
                .build();
    }
}
