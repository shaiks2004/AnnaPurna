package com.annapurna.lot;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LotDocumentRepository extends JpaRepository<LotDocument, UUID> {
    List<LotDocument> findByLotIdOrderByCreatedAtAsc(UUID lotId);
}