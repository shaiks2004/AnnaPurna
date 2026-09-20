package com.annapurna.common.web;

import java.util.List;
import org.springframework.data.domain.Page;

public record PageResponse<T>(List<T> data, PageMetadata page) {
    public static <T> PageResponse<T> from(Page<T> result) {
        return new PageResponse<>(result.getContent(), new PageMetadata(
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages()));
    }

    public record PageMetadata(int number, int size, long totalElements, int totalPages) {}
}
