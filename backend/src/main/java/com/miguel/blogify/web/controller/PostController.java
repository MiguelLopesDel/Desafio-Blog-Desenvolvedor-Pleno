package com.miguel.blogify.web.controller;

import com.miguel.blogify.domain.dto.PostRequest;
import com.miguel.blogify.domain.dto.PostResponse;
import com.miguel.blogify.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostRequest> createPost(@RequestBody @Valid PostRequest postRequest, Authentication authentication) {
       return ResponseEntity.ok(postService.create(postRequest, authentication));
    }

    @GetMapping
    public Page<PostResponse> getPosts(@PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return postService.getPosts(pageable);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }
}
