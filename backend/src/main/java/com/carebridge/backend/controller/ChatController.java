package com.carebridge.backend.controller;

import com.carebridge.backend.dto.ChatRequest;
import com.carebridge.backend.dto.ChatResponse;
import com.carebridge.backend.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/test")
    public String test() {
        return "CareBridge Chatbot Backend is working!";
    }

    @PostMapping("/message")
    public ChatResponse chat(@RequestBody ChatRequest request) {

        String reply = chatService.chat(
                request.getMood(),
                request.getMessage()
        );

        return new ChatResponse(reply);
    }
}