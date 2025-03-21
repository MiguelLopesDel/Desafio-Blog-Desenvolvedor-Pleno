package com.miguel.blogify.web.controller;

import com.miguel.blogify.domain.dto.AuthDTO;
import com.miguel.blogify.security.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid AuthDTO authDTO) {
        return ResponseEntity.ok(authService.authenticate(authDTO));
    }
}

