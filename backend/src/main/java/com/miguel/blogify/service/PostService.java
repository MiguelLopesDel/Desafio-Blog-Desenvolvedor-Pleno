package com.miguel.blogify.service;

import com.miguel.blogify.config.PostProperties;
import com.miguel.blogify.domain.dto.PostRequest;
import com.miguel.blogify.domain.dto.PostResponse;
import com.miguel.blogify.domain.entity.Post;
import com.miguel.blogify.domain.entity.User;
import com.miguel.blogify.domain.exception.AccessDeniedException;
import com.miguel.blogify.domain.exception.PostNotFoundException;
import com.miguel.blogify.domain.exception.UserNotFoundException;
import com.miguel.blogify.domain.exception.ValidationException;
import com.miguel.blogify.mapper.PostMapper;
import com.miguel.blogify.repository.PostRepository;
import com.miguel.blogify.repository.UserRepository;
import com.miguel.blogify.security.service.PostAuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;
    private final ContentSanitizer sanitizerService;
    private final PostAuthorizationService postAuthService;
    private final PostProperties postProperties;

    @CacheEvict(value = {"publicPosts", "userPosts"}, allEntries = true)
    public PostRequest create(PostRequest postRequest, Authentication authentication) {
        log.info("Criando novo post para o usuário: {}", authentication.getName());
        validateContentSize(postRequest.content());

        String sanitizedJson = sanitizerService.sanitizeEditorContent(postRequest.content());
        PostRequest sanitizedRequest = postMapper.createSanitizedRequest(postRequest, sanitizedJson);

        User user = findUserByEmail(authentication.getName());
        Post post = postMapper.toEntity(sanitizedRequest);
        post.setUser(user);

        Post save = postRepository.save(post);
        log.info("Post criado com sucesso. ID: {}", save.getId());
        return postMapper.toDTO(save);
    }

    @Cacheable(value = "publicPosts", key = "T(java.lang.String).format('%d:%d', #pageable.pageNumber, #pageable.pageSize)")
    public Page<PostResponse> getPublicPosts(Pageable pageable) {
        log.info("Buscando posts públicos");
        return postRepository.findByIsPrivateAndActiveTrue(false, pageable).map(postMapper::toResponse);
    }

    @Cacheable(value = "postDetails", key = "#id", condition = "!#result.isPrivate()")
    public PostResponse getPostById(Long id, Authentication authentication) {
        log.info("Buscando post por ID: {}", id);
        Post post = findPostById(id);
        User user = authentication != null ?
                findUserByEmail(authentication.getName()) : null;

        if (Boolean.TRUE.equals(post.getIsPrivate()) && (user == null || !postAuthService.canUserAccessPost(user, post))) {
            log.warn("Tentativa de acesso não autorizado ao post ID: {}", id);
            throw new AccessDeniedException("Você não tem permissão para acessar este post");
        }

        return postMapper.toResponse(post);
    }

    @Cacheable(value = "userPosts", key = "#email")
    public Page<PostResponse> getPostsByUser(String email, Pageable pageable) {
        log.info("Buscando posts do usuário: {}", email);
        User user = findUserByEmail(email);
        return postRepository.findByUserAndActiveTrue(user, pageable)
                .map(postMapper::toResponse);
    }

    @CacheEvict(value = {"publicPosts", "postDetails"}, allEntries = true)
    public void deletePostById(Long id, Authentication authentication) {
        log.info("Excluindo post ID: {} por usuário: {}", id, authentication.getName());
        Post post = findPostById(id);
        User user = findUserByEmail(authentication.getName());

        if (!postAuthService.canUserDeletePost(user, post)) {
            log.warn("Tentativa não autorizada de excluir post ID: {}", id);
            throw new AccessDeniedException("Você não tem permissão para excluir este post");
        }

        post.setActive(false);
        postRepository.save(post);
        log.info("Post ID: {} marcado como inativo", id);
    }

    @CacheEvict(value = "postDetails", key = "#id")
    @CachePut(value = "postDetails", key = "#id")
    public PostRequest updatePost(Long id, PostRequest postRequest, Authentication authentication) {
        log.info("Atualizando post ID: {} por usuário: {}", id, authentication.getName());
        Post post = findPostById(id);
        User user = findUserByEmail(authentication.getName());

        if (!postAuthService.canUserEditPost(user, post)) {
            log.warn("Tentativa não autorizada de editar post ID: {}", id);
            throw new AccessDeniedException("Você não tem permissão para editar este post");
        }

        validateContentSize(postRequest.content());
        String sanitizedJson = sanitizerService.sanitizeEditorContent(postRequest.content());


        postMapper.updatePostFromRequest(postRequest, sanitizedJson, post);
        log.info("Post ID: {} atualizado com sucesso", id);
        return postMapper.toDTO(postRepository.save(post));
    }

    public Page<PostResponse> getAllPosts(boolean justActive, Pageable pageable) {
        log.info("Buscando todos os posts com active={}", justActive);
        return postRepository.findByActive(justActive, pageable).map(postMapper::toResponse);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(UserNotFoundException::new);
    }

    private Post findPostById(Long id) {
        Post post = postRepository.findById(id).orElseThrow(PostNotFoundException::new);

        if (Boolean.FALSE.equals(post.getActive())) {
            throw new PostNotFoundException();
        }

        return post;
    }

    public void validateContentSize(String content) {
        if (content != null && content.length() > postProperties.getMaxContentLength()) {
            log.warn("Conteúdo excede o limite de caracteres: {}", postProperties.getMaxContentLength());
            throw new ValidationException("Conteúdo do post excede o limite de " + postProperties.getMaxContentLength() + " caracteres");
        }
    }
}
