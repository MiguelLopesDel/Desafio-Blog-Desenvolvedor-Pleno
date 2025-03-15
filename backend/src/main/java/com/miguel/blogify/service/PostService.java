package com.miguel.blogify.service;

import com.miguel.blogify.domain.dto.PostRequest;
import com.miguel.blogify.domain.dto.PostResponse;
import com.miguel.blogify.mapper.PostMapper;
import com.miguel.blogify.repository.PostRepository;
import com.miguel.blogify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;

    public PostRequest create(PostRequest postRequest, Authentication authentication) {
        userRepository.findByEmail(authentication.getName()).orElseThrow();
        return postMapper.toDTO(postRepository.save(postMapper.toEntity(postRequest)));
    }

    public Page<PostResponse> getPosts(Pageable pageable) {
        return postRepository.findAll(pageable).map(postMapper::toResponse);
    }

    public List<PostResponse> getAllPosts() {
        return postRepository.findAll().stream().map(postMapper::toResponse).toList();
    }
}
