package com.innovest.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.onnx.allminilml6v2q.AllMiniLmL6V2QuantizedEmbeddingModel;
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
        try {
            // Parse the Postgres URL to extract host, port, etc.
            // Azure URL format: jdbc:postgresql://<host>:<port>/<database>?sslmode=require&user=<user>&password=<password>
            String cleanUrl = databaseUrl.replace("jdbc:postgresql://", "");

            // Separate query params
            String query = "";
            if (cleanUrl.contains("?")) {
                int qIndex = cleanUrl.indexOf("?");
                query = cleanUrl.substring(qIndex + 1);
                cleanUrl = cleanUrl.substring(0, qIndex);
            }

            // Extract host, port, db
            int slashIndex = cleanUrl.indexOf("/");
            String hostPort = cleanUrl.substring(0, slashIndex);
            String database = cleanUrl.substring(slashIndex + 1);

            String host = hostPort;
            int port = 5432;
            if (hostPort.contains(":")) {
                String[] split = hostPort.split(":");
                host = split[0];
                port = Integer.parseInt(split[1]);
            }

            // Configure PGSimpleDataSource
            // We use the driver implementation directly to ensure SSL is handled correctly
            org.postgresql.ds.PGSimpleDataSource dataSource = new org.postgresql.ds.PGSimpleDataSource();
            dataSource.setServerNames(new String[]{host});
            dataSource.setPortNumbers(new int[]{port});
            dataSource.setDatabaseName(database);
            dataSource.setUser(databaseUser);
            dataSource.setPassword(databasePassword);
            
            // Enable SSL if detected in URL or if assumed for Azure
            // Note: Azure requires SSL, so we default to it if "sslmode" is present or if we want to be safe
            if (query.contains("sslmode=require") || query.contains("sslmode=verify")) {
                dataSource.setSsl(true);
                dataSource.setSslMode("require");
            }

            return PgVectorEmbeddingStore.builder()
                    .datasource(dataSource)
                    .table("embeddings")
                    .dimension(384)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to configure PgVectorEmbeddingStore: " + e.getMessage(), e);
        }
    }
}
