package com.innovest.dto;

import com.innovest.domain.Deal;
import com.innovest.domain.DealDocument;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DealMapper {

    PublicDealDTO toPublicDto(Deal deal);

    @Mapping(target = "documents", source = "documents")
    PrivateDealDTO toPrivateDto(Deal deal, java.util.List<DealDocumentDTO> documents);

    DealDocumentDTO toDocumentDto(DealDocument document);
}
