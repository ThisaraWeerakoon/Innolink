package com.innovest.dto;

import com.innovest.domain.DocType;
import java.util.UUID;

public class DealDocumentDTO {
    private UUID id;
    private String fileUrl;
    private DocType fileType;
    private boolean isPrivate;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public DocType getFileType() {
        return fileType;
    }

    public void setFileType(DocType fileType) {
        this.fileType = fileType;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean aPrivate) {
        isPrivate = aPrivate;
    }
}
