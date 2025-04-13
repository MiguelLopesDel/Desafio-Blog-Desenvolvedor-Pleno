package com.miguel.blogify.web.controller;

import com.miguel.blogify.domain.dto.AuthDTO;
import com.miguel.blogify.security.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody @Valid AuthDTO authDTO) {
        return ResponseEntity.ok(Map.of("token", authService.authenticate(authDTO)));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> result = authService.validateToken(authHeader);
        return Boolean.TRUE.equals(result.get("valid")) ? ResponseEntity.ok(result)
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }
}

