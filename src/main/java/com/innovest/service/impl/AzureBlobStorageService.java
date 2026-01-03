package com.innovest.service.impl;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.innovest.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.UUID;

@Service
@Profile({"prod", "dev"})
public class AzureBlobStorageService implements StorageService {

    @Autowired
    private BlobServiceClient blobServiceClient;

    @org.springframework.beans.factory.annotation.Value("${spring.cloud.azure.storage.blob.container-name}")
    private String containerName;

    @Override
    public String store(MultipartFile file, String containerName) {
        return uploadFile(file, containerName);
    }

    @Override
    public Resource load(String fileUrl) {
         try {
            return new UrlResource(fileUrl);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid file URL: " + fileUrl, e);
        }
    }

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AzureBlobStorageService.class);

    @Override
    public String uploadFile(MultipartFile file, String folderName) {
        try {
            logger.info("Starting file upload. Original filename: {}, Size: {}", file.getOriginalFilename(), file.getSize());
            
            // Use configured container name if folderName is not provided or specialized logic needed
            logger.info("Using Azure Blob operations. Target Container: {}", containerName);
            
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
            if (!containerClient.exists()) {
                logger.info("Container {} does not exist. Creating it...", containerName);
                containerClient.create();
                logger.info("Container created.");
            } else {
                logger.info("Container {} exists.", containerName);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            logger.info("Generated unique filename: {}", filename);

            BlobClient blobClient = containerClient.getBlobClient(filename);
            logger.info("Uploading to blob endpoint: {}", blobClient.getBlobUrl());
            
            blobClient.upload(file.getInputStream(), file.getSize(), true);
            logger.info("Upload successful. Filename returned: {}", filename);

            return filename;
        } catch (IOException e) {
            logger.error("Failed to upload file to Azure Blob Storage", e);
            throw new RuntimeException("Failed to upload file to Azure Blob Storage", e);
        }
    }

    @Override
    public byte[] downloadFile(String filename) {
        try {
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
            BlobClient blobClient = containerClient.getBlobClient(filename);
            
            if (!blobClient.exists()) {
                 throw new RuntimeException("File not found: " + filename);
            }
            
            try (var outputStream = new java.io.ByteArrayOutputStream()) {
                blobClient.downloadStream(outputStream);
                return outputStream.toByteArray();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file from Azure Blob Storage", e);
        }
    }
}
