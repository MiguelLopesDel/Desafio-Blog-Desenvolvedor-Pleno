package com.miguel.blogify.domain.dto;

import java.time.LocalDateTime;

public record PostResponse(String title, String content, LocalDateTime createdAt) {}
