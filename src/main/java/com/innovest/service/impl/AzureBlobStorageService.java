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
@Profile("prod")
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

    @Override
    public String uploadFile(MultipartFile file, String folderName) {
        try {
            // Use configured container name if folderName is not provided or specialized logic needed
            // For now assuming folderName acts as containerName or we use the injected one.
            // Requirement says: "spring.cloud.azure.storage.blob.container-name=innovest-data"
            // And logic: "Generate a unique filename (UUID), upload the file, and return the unique filename"
            // It seems "folderName" arg in `uploadFile` might be the container name or a subfolder.
            // Let's use the injected containerName for the main container.
            
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
            if (!containerClient.exists()) {
                containerClient.create();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            BlobClient blobClient = containerClient.getBlobClient(filename);
            blobClient.upload(file.getInputStream(), file.getSize(), true);

            return filename;
        } catch (IOException e) {
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
