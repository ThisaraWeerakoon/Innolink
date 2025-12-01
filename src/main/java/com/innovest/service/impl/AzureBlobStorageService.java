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

    @Override
    public String store(MultipartFile file, String containerName) {
        try {
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
            if (!containerClient.exists()) {
                containerClient.create();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String blobName = UUID.randomUUID().toString() + extension;

            BlobClient blobClient = containerClient.getBlobClient(blobName);
            blobClient.upload(file.getInputStream(), file.getSize(), true);

            return blobClient.getBlobUrl();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Azure Blob Storage", e);
        }
    }

    @Override
    public Resource load(String fileUrl) {
        try {
            return new UrlResource(fileUrl);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid file URL: " + fileUrl, e);
        }
    }
}
