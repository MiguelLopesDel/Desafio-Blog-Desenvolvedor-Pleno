package com.miguel.blogify.security.service;

import com.miguel.blogify.domain.dto.AuthDTO;
import com.miguel.blogify.domain.entity.User;
import com.miguel.blogify.domain.exception.UserNotFoundException;
import com.miguel.blogify.repository.UserRepository;
import com.miguel.blogify.security.jwt.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;

    public String authenticate(AuthDTO authDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authDTO.email(),
                        authDTO.password()
                )
        );

        User user = (User) authentication.getPrincipal();
        return tokenProvider.generateToken(user);
    }

    public Map<String, Object> validateToken(String authHeader) {
        String valid = "valid";
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Map.of(valid, false);
        }

        try {
            String jwt = authHeader.substring(7);
            String username = tokenProvider.validateAndExtractUsername(jwt);
            return Map.of(valid, true, "username", username);
        } catch (Exception e) {
            return Map.of(valid, false);
        }
    }
}

