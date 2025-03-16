package com.miguel.blogify.security.jwt;

import com.miguel.blogify.domain.entity.User;

public interface TokenProvider {
    String generateToken(User user);
    String validateAndExtractUsername(String token);
}
