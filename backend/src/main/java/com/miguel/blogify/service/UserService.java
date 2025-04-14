package com.miguel.blogify.service;

import com.miguel.blogify.domain.dto.AuthDTO;
import com.miguel.blogify.domain.dto.RegisterUserDTO;
import com.miguel.blogify.domain.dto.UserResponseDTO;
import com.miguel.blogify.domain.entity.User;
import com.miguel.blogify.domain.entity.VerificationToken;
import com.miguel.blogify.domain.exception.EmailAlreadyExistException;
import com.miguel.blogify.domain.exception.InvalidTokenException;
import com.miguel.blogify.domain.exception.TokenExpiredException;
import com.miguel.blogify.domain.exception.UserNotFoundException;
import com.miguel.blogify.domain.type.UserRole;
import com.miguel.blogify.mapper.UserMapper;
import com.miguel.blogify.repository.UserRepository;
import com.miguel.blogify.repository.VerificationTokenRepository;
import com.miguel.blogify.security.jwt.TokenProvider;
import com.miguel.blogify.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final VerificationTokenRepository tokenRepository;
    private final AuthService authService;
    private final TokenProvider tokenProvider;
    @Value("${app.frontend.url}")
    private String frontendUrl;

    public String initiateRegistration(RegisterUserDTO dto) {
        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new EmailAlreadyExistException("E-mail já cadastrado!");
        }

        Optional<VerificationToken> existingToken = tokenRepository.findByEmail(dto.email());
        existingToken.ifPresent(tokenRepository::delete);

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .email(dto.email())
                .name(dto.name())
                .password(passwordEncoder.encode(dto.password()))
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .build();

        tokenRepository.save(verificationToken);

        String link = frontendUrl + "/confirm-email?token=" + token;
        emailService.send(dto.email(), "Blogify - Confirme seu email", emailService.buildVerificationEmail(dto.name(), link)
        );

        return "Por favor, verifique seu email para completar o registro.";
    }

    public String confirmEmail(String token) {
        cleanupExpiredTokens();
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token inválido!"));

        if (verificationToken.isConfirmed()) {
            throw new InvalidTokenException("Email já confirmado!");
        }

        if (verificationToken.isExpired()) {
            throw new TokenExpiredException("Token expirado!");
        }

        verificationToken.setConfirmedAt(LocalDateTime.now());
        tokenRepository.save(verificationToken);

        User user = User.builder()
                .email(verificationToken.getEmail())
                .name(verificationToken.getName())
                .password(verificationToken.getPassword())
                .roles(Collections.singleton(UserRole.USER))
                .build();

        userRepository.save(user);
        return tokenProvider.generateToken(user);
    }

    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiresAtLessThan(LocalDateTime.now());
    }

    public UserResponseDTO register(RegisterUserDTO dto) {
        userRepository.findByEmail(dto.email()).ifPresent(user -> {
            throw new EmailAlreadyExistException("E-mail já cadastrado!");
        });

        User user = userMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRoles(Collections.singleton(UserRole.USER));
        userRepository.save(user);
        return userMapper.toResponseDTO(user);
    }

    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado!"));
        return userMapper.toResponseDTO(user);
    }
}
