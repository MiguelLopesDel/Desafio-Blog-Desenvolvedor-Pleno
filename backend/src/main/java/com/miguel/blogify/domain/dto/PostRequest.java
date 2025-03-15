package com.miguel.blogify.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record PostRequest(@NotBlank String title, @NotBlank String content) {}
