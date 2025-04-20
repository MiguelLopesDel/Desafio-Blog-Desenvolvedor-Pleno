package com.miguel.blogify.repository;

import com.miguel.blogify.domain.entity.Post;
import com.miguel.blogify.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByIsPrivateAndActiveTrue(boolean isPrivate, Pageable pageable);

    Page<Post> findByUserAndActiveTrue(User user, Pageable pageable);

    Page<Post> findByActive(Boolean active, Pageable pageable);

    List<Post> findByIsPrivateTrue();
}
