package com.miguel.blogify.security.service;

import com.miguel.blogify.domain.entity.Post;
import com.miguel.blogify.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostAuthorizationService {

    public boolean canUserAccessPost(User user, Post post) {
        return user.getId().equals(post.getUser().getId()) ||
                hasAdminRole(user);
    }

    public boolean canUserEditPost(User user, Post post) {
        return user.getId().equals(post.getUser().getId());
    }

    public boolean canUserDeletePost(User user, Post post) {
        return user.getId().equals(post.getUser().getId()) || hasAdminRole(user);
    }

    private boolean hasAdminRole(User user) {
        return user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
