package com.annapurna.lot;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lot_document")
public class LotDocument {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_id", nullable = false)
    private Lot lot;

    @Column(name = "document_type_code", nullable = false, length = 64)
    private String documentTypeCode;

    @Column(name = "storage_reference", nullable = false, unique = true, length = 1024)
    private String storageReference;

    @Column(name = "original_filename", length = 512)
    private String originalFilename;

    @Column(name = "content_type")
    private String contentType;

    @Column(length = 128)
    private String checksum;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected LotDocument() {}

    public static LotDocument create(
            Lot lot,
            String documentTypeCode,
            String storageReference,
            String originalFilename,
            String contentType,
            String checksum) {
        LotDocument document = new LotDocument();
        document.lot = lot;
        document.documentTypeCode = documentTypeCode;
        document.storageReference = storageReference;
        document.originalFilename = originalFilename;
        document.contentType = contentType;
        document.checksum = checksum;
        return document;
    }

    public UUID getId() { return id; }
    public Lot getLot() { return lot; }
    public String getDocumentTypeCode() { return documentTypeCode; }
    public String getStorageReference() { return storageReference; }
    public String getOriginalFilename() { return originalFilename; }
    public String getContentType() { return contentType; }
    public String getChecksum() { return checksum; }
    public Instant getCreatedAt() { return createdAt; }

    @PrePersist
    void assignIdAndTimestamp() {
        id = UUID.randomUUID();
        createdAt = Instant.now();
    }
}
