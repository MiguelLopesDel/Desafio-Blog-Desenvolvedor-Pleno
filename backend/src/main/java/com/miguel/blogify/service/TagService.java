package com.miguel.blogify.service;

import com.miguel.blogify.domain.dto.TagDTO;
import com.miguel.blogify.mapper.TagMapper;
import com.miguel.blogify.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    public List<TagDTO> getAllTags() {
        return tagRepository.findAll()
                .stream()
                .map(tagMapper::toResponseDTO)
                .toList();
    }
}
