package com.miguel.blogify.mapper;

import com.miguel.blogify.domain.dto.RegisterUserDTO;
import com.miguel.blogify.domain.dto.UserResponseDTO;
import com.miguel.blogify.domain.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDTO toResponseDTO(User user);
    User toEntity(RegisterUserDTO dto);
}

