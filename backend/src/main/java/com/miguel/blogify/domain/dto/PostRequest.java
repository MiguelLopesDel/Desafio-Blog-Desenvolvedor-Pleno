package com.miguel.blogify.domain.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record PostRequest(@NotBlank String title, @NotBlank String content, List<String> tags, boolean isPrivate) {}
