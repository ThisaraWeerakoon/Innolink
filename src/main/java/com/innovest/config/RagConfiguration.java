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
        // LangChain4j 0.31.0 workaround:
        // 1. Manual URL parsing (no .dataSource() in builder)
        // 2. Append ?sslmode=require to database name (no .ssl() in builder)
        // 3. Remove .usePostgresDefaultSchema() (does not exist)

        String host = "localhost";
        int port = 5432;
        String database = "innolink";
        boolean useSsl = false;

        try {
            // Azure URL: jdbc:postgresql://host:port/database?sslmode=require&...
            String cleanUrl = databaseUrl.replace("jdbc:postgresql://", "");
            
            // Extract query params for SSL check
            if (cleanUrl.contains("?")) {
                String query = cleanUrl.substring(cleanUrl.indexOf("?") + 1);
                if (query.contains("sslmode=require") || query.contains("sslmode=verify")) {
                    useSsl = true;
                }
                cleanUrl = cleanUrl.substring(0, cleanUrl.indexOf("?"));
            }

            int slashIndex = cleanUrl.indexOf("/");
            String hostPort = cleanUrl.substring(0, slashIndex);
            
            // Set database name
            database = cleanUrl.substring(slashIndex + 1);
            
            // If SSL is needed, append it to the database name as a hack
            // so the underlying driver sees ".../innolink?sslmode=require"
            if (useSsl) {
                database = database + "?sslmode=require";
            }

            String[] hostPortSplit = hostPort.split(":");
            host = hostPortSplit[0];
            if (hostPortSplit.length > 1) {
                port = Integer.parseInt(hostPortSplit[1]);
            }
        } catch (Exception e) {
             System.err.println("Failed to parse DB URL for PGVector: " + e.getMessage());
        }

        return PgVectorEmbeddingStore.builder()
                .host(host)
                .port(port)
                .database(database)
                .user(databaseUser)
                .password(databasePassword)
                .table("embeddings")
                .dimension(384)
                .build();
    }
}
