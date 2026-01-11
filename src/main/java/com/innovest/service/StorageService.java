package com.innovest.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String path);
    Resource load(String path);
    String uploadFile(MultipartFile file, String folderName);
    byte[] downloadFile(String filename);
}
