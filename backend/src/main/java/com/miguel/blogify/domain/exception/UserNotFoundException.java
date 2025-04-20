package com.miguel.blogify.domain.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String s) {
        super(s);
    }

    public UserNotFoundException() {
        super("Usuário não encontrado");
    }
}
