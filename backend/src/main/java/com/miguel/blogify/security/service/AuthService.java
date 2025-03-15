package com.miguel.blogify.security.service;

import com.miguel.blogify.domain.dto.AuthDTO;
import com.miguel.blogify.domain.entity.User;
import com.miguel.blogify.domain.exception.UserNotFoundException;
import com.miguel.blogify.repository.UserRepository;
import com.miguel.blogify.security.jwt.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider jwtService;

    public String authenticate(AuthDTO authDTO) {
        User user = userRepository.findByEmail(authDTO.email())
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado!"));

        if (!passwordEncoder.matches(authDTO.password(), user.getPassword())) {
            throw new BadCredentialsException("Senha incorreta!");
        }

        return jwtService.generateToken(user);
    }
}

