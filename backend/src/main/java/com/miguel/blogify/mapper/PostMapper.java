package com.miguel.blogify.mapper;

import com.miguel.blogify.domain.dto.PostRequest;
import com.miguel.blogify.domain.dto.PostResponse;
import com.miguel.blogify.domain.entity.Post;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostMapper {

    PostRequest toDTO(Post post);
    PostResponse toResponse(Post post);

    Post toEntity(PostRequest dto);
}

