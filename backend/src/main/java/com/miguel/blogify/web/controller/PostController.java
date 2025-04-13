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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostRequest> createPost(@RequestBody @Valid PostRequest postRequest,
                                                  Authentication authentication) {
        return ResponseEntity.ok(postService.create(postRequest, authentication));
    }

    @GetMapping
    public Page<PostResponse> getPublicPosts(@PageableDefault(size = 5, sort = "createdAt",
            direction = Sort.Direction.DESC) Pageable pageable) {
        return postService.getPublicPosts(pageable);
    }

    @GetMapping("/all")
    @PreAuthorize(value = "hasRole('ROLE_ADMIN')")
    public Page<PostResponse> getAllPosts(@PageableDefault(size = 100, sort = "updatedAt",
            direction = Sort.Direction.DESC) Pageable pageable) {
        return postService.getAllPosts(true, pageable);
    }

    @GetMapping("/user")
    public Page<PostResponse> getUserPosts(@PageableDefault(size = 100, sort = "updatedAt",
            direction = Sort.Direction.DESC) Pageable pageable, Authentication authentication) {
        return postService.getPostsByUser(authentication.getName(), pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(postService.getPostById(id, authentication));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostRequest> updatePost(@PathVariable Long id,
                                                  @RequestBody @Valid PostRequest postRequest,
                                                  Authentication authentication) {
        return ResponseEntity.ok(postService.updatePost(id, postRequest, authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication authentication) {
        postService.deletePostById(id, authentication);
        return ResponseEntity.ok().build();
    }
}
