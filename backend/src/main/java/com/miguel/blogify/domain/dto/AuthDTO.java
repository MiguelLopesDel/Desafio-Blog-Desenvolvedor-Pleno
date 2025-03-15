package com.miguel.blogify.domain.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthDTO(@Email(message = "Email deve ser válido")
                      @NotBlank(message = "Email não pode estar em branco") String email,
                      @NotBlank(message = "Senha não pode estar em branco")
                      @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres") String password) {
}
