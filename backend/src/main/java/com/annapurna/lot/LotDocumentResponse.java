package com.annapurna.lot;

import java.time.Instant;
import java.util.UUID;

public record LotDocumentResponse(
        UUID id,
        UUID lotId,
        String documentTypeCode,
        String storageReference,
        String originalFilename,
        String contentType,
        String checksum,
        Instant createdAt) {
    public static LotDocumentResponse from(LotDocument document) {
        return new LotDocumentResponse(
                document.getId(),
                document.getLot().getId(),
                document.getDocumentTypeCode(),
                document.getStorageReference(),
                document.getOriginalFilename(),
                document.getContentType(),
                document.getChecksum(),
                document.getCreatedAt());
    }
}