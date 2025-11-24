package com.innovest.dto;

import java.util.List;

public class PrivateDealDTO extends PublicDealDTO {
    private List<DealDocumentDTO> documents;

    public List<DealDocumentDTO> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DealDocumentDTO> documents) {
        this.documents = documents;
    }
}
