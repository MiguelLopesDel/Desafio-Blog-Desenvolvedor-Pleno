package com.miguel.blogify.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.miguel.blogify.domain.exception.ContentProcessingException;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContentSanitizer {

    public String sanitizeEditorContent(String content) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode editorContent = mapper.readTree(content);

            if (editorContent.has("blocks") && editorContent.get("blocks").isArray()) {
                JsonNode blocks = editorContent.get("blocks");
                for (int i = 0; i < blocks.size(); i++) {
                    sanitizeBlock(blocks.get(i));
                }
            }

            return mapper.writeValueAsString(editorContent);
        } catch (Exception e) {
            throw new ContentProcessingException("Erro ao sanitizar conteúdo do editor");
        }
    }

    private void sanitizeBlock(JsonNode block) {
        if (!block.has("type") || !block.has("data")) {
            return;
        }

        String type = block.get("type").asText();
        JsonNode data = block.get("data");
        ObjectMapper mapper = new ObjectMapper();

        switch (type) {
            case "paragraph", "header", "quote" -> {
                if (data.has("text")) {
                    String text = data.get("text").asText();
                    String sanitized = Jsoup.clean(text, Safelist.basicWithImages());
                    ((ObjectNode) data).put("text", sanitized);
                }
            }
            case "list" -> {
                if (data.has("items") && data.get("items").isArray()) {
                    ArrayNode items = (ArrayNode) data.get("items");
                    for (int i = 0; i < items.size(); i++) {
                        String item = items.get(i).asText();
                        String sanitized = Jsoup.clean(item, Safelist.basicWithImages());
                        items.set(i, mapper.valueToTree(sanitized));
                    }
                }
            }
            case "image" -> {
                if (data.has("caption")) {
                    String caption = data.get("caption").asText();
                    String sanitized = Jsoup.clean(caption, Safelist.none());
                    ((ObjectNode) data).put("caption", sanitized);
                }
            }
            case "code" -> {
                if (data.has("code")) {
                    String code = data.get("code").asText();
                    String sanitized = Jsoup.clean(code, Safelist.none());
                    ((ObjectNode) data).put("code", sanitized);
                }
            }
        }
    }
}