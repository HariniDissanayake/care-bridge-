package com.carebridge.backend.service;

import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final GeminiService geminiService;

    public ChatService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public String chat(String mood, String message) {

        if (mood == null || mood.isBlank()) {
            mood = "UNKNOWN";
        }

        if (message == null || message.isBlank()) {
            return "Please tell me how you are feeling.";
        }

        return geminiService.generateResponse(
                mood,
                message
        );
    }
}