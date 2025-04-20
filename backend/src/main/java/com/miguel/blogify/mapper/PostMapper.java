package com.miguel.blogify.mapper;

import com.miguel.blogify.domain.dto.PostRequest;
import com.miguel.blogify.domain.dto.PostResponse;
import com.miguel.blogify.domain.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PostMapper {

    @Mapping(target = "isPrivate", source = "isPrivate")
    PostRequest toDTO(Post post);

    @Mapping(target = "author", source = "user.name")
    @Mapping(target = "isPrivate", source = "isPrivate")
    PostResponse toResponse(Post post);

    @Mapping(target = "isPrivate", source = "isPrivate", defaultExpression = "java(Boolean.FALSE)")
    Post toEntity(PostRequest dto);

    @Mapping(target = "content", source = "sanitizedContent")
    PostRequest createSanitizedRequest(PostRequest source, String sanitizedContent);

    @Mapping(target = "content", source = "sanitizedContent")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updatePostFromRequest(PostRequest source, String sanitizedContent, @MappingTarget Post target);
}

