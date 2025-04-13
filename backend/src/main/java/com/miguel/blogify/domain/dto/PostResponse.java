package com.miguel.blogify.domain.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(String title, String content, List<String> tags, LocalDateTime createdAt,
                           String author, Long id, boolean isPrivate) {
}
