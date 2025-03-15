package com.miguel.blogify.web.controller;

import com.miguel.blogify.domain.dto.RegisterUserDTO;
import com.miguel.blogify.domain.dto.UserResponseDTO;
import com.miguel.blogify.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody @Valid RegisterUserDTO dto) {
        return ResponseEntity.ok(userService.register(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}

