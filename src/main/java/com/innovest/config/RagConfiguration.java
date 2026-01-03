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
    public EmbeddingStore<TextSegment> embeddingStore(javax.sql.DataSource dataSource) {
        return PgVectorEmbeddingStore.builder()
                .datasource(dataSource)
                .table("embeddings")
                .dimension(384) // Matches AllMiniLmL6V2
                .build();
    }
}
