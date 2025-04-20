package com.miguel.blogify.domain.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "post_tags")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tag")
    private String name;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

}

