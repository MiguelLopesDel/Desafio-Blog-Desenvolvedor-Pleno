package com.miguel.blogify.repository;

import com.miguel.blogify.domain.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);

    Optional<VerificationToken> findByEmail(String email);

    void deleteByExpiresAtLessThan(LocalDateTime now);
}