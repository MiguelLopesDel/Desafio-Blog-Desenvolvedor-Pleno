package com.miguel.blogify.mapper;

import com.miguel.blogify.domain.dto.TagDTO;
import com.miguel.blogify.domain.entity.Tag;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TagMapper {

    TagDTO toResponseDTO(Tag tag);
}

