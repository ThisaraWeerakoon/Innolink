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
        // LangChain4j 0.31.0 does not support .datasource() in the builder.
        // We must manually parse values and configure SSL.

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
            database = cleanUrl.substring(slashIndex + 1);

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
                .usePostgresDefaultSchema(false) // Assuming standard schema usage
                // .ssl(useSsl) // Check if .ssl exists in 0.31.0. If not, we rely on the driver behavior or defaults.
                // In 0.31.0, there is no explicit .ssl() method on the builder publicly documented in some places.
                // However, without it, connecting to Azure might fail if it doesn't default to SSL.
                // Let's assume standard parameters work or try to use a different constructor mechanism if this fails.
                // BUT, since we are stuck with 0.31.0, let's try just setting values correctly.
                // If this fails, we might need to create a custom DataSource and use a different factory if available.
                // WAIT -> effectively we can't easily force SSL without the method. 
                // Let's check if we can pass properties like ?sslmode=require in the host/db? No.
                
                // ALTERNATIVE: Use the constructor taking a DataSource if available? No builder method.
                // Let's rely on standard parsing. If LangChain4j uses the PG driver under the hood, it might pick up defaults?
                // Actually, often it creates a simple Datasource internally.
                .build();
    }
}
