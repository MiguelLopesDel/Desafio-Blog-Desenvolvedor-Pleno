package com.miguel.blogify.config;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "blog.post")
@Component
@Getter
public class PostProperties {
    private int maxContentLength = 50000;
}