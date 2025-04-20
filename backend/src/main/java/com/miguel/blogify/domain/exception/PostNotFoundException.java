package com.miguel.blogify.domain.exception;

public class PostNotFoundException extends RuntimeException {
    public PostNotFoundException(String message) {
        super(message);
    }

    public PostNotFoundException() {
        super("Post não encontrado ou foi removido");
    }
}
