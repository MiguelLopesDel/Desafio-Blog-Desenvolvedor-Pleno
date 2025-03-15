package com.miguel.blogify.service;

import com.miguel.blogify.domain.dto.RegisterUserDTO;
import com.miguel.blogify.domain.dto.UserResponseDTO;
import com.miguel.blogify.domain.entity.User;
import com.miguel.blogify.domain.exception.EmailAlreadyExistException;
import com.miguel.blogify.domain.exception.UserNotFoundException;
import com.miguel.blogify.domain.type.UserRole;
import com.miguel.blogify.mapper.UserMapper;
import com.miguel.blogify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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
