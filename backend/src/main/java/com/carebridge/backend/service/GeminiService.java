package com.carebridge.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import jakarta.annotation.PostConstruct;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    public GeminiService() {


        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();

    }

    @PostConstruct
    public void checkConfiguration() {
        System.out.println("=================================");
        System.out.println("Gemini model: " + model);
        System.out.println("Gemini API key loaded: " + (apiKey != null && !apiKey.isBlank()));
        System.out.println("=================================");
    }

    public String generateResponse(
            String mood,
            String userMessage
    ) {

        String instructions = """
                You are Aria, the AI companion for CareBridge.

                You are an emotional support companion.

                Your job is to:
                - listen carefully
                - respond with empathy
                - acknowledge the user's feelings
                - use calm and supportive language
                - ask gentle questions when appropriate
                - keep responses conversational

                Important rules:
                - Do not diagnose medical conditions.
                - Do not pretend to be a doctor.
                - Do not prescribe medication.
                - Do not judge the user.
                - Do not give dangerous advice.
                - Do not pretend to be a human.

                If the user indicates immediate danger
                or self-harm, prioritize safety and encourage
                them to seek appropriate professional or
                emergency support.

                The user's selected mood is:
                """ + mood;

        String prompt = instructions
                + "\n\nUser message:\n"
                + userMessage;

        Map<String, Object> requestBody = Map.of(

                "system_instruction",
                Map.of(
                        "parts",
                        List.of(
                                Map.of(
                                        "text",
                                        instructions
                                )
                        )
                ),

                "contents",
                List.of(
                        Map.of(
                                "role",
                                "user",

                                "parts",
                                List.of(
                                        Map.of(
                                                "text",
                                                prompt
                                        )
                                )
                        )
                )
        );

        Map response = restClient
                .post()
                .uri(uriBuilder ->
                        uriBuilder
                                .path(
                                        "/v1/models/{model}:generateContent"
                                )
                                .queryParam("key", apiKey)
                                .build(model)
                )

                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        return extractText(response);
    }

    private String extractText(Map response) {

        try {

            List candidates =
                    (List) response.get("candidates");

            if (candidates == null || candidates.isEmpty()) {
                throw new RuntimeException(
                        "Gemini did not return any candidates."
                );
            }

            Map candidate =
                    (Map) candidates.get(0);

            Map content =
                    (Map) candidate.get("content");

            List parts =
                    (List) content.get("parts");

            Map firstPart =
                    (Map) parts.get(0);

            Object text =
                    firstPart.get("text");

            if (text == null) {
                throw new RuntimeException(
                        "Gemini response did not contain text."
                );
            }

            return text.toString();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Could not process Gemini response.",
                    e
            );
        }
    }
}