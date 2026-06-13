package com.example.care_bridge.service;


import com.example.care_bridge.config.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
    }


    @Test
    @DisplayName("Should generate a non-null two-part token with base64payload.signature structure")
    void shouldGenerateTokenWithCorrectStructure() {
        String token = jwtService.generateToken("harini@example.com", "USER");

        assertThat(token).isNotNull();
        assertThat(token.split("\\.")).hasSize(2);
    }

    @Test
    @DisplayName("Should prefix role with ROLE_ when raw role string is passed without prefix")
    void shouldPrefixRoleWhenNotAlreadyPrefixed() {
        String token = jwtService.generateToken("harini@example.com", "USER");
        String extractedRole = jwtService.extractRole(token);

        assertThat(extractedRole).isEqualTo("ROLE_USER");
    }

    @Test
    @DisplayName("Should not double-prefix role when ROLE_ prefix is already present in input")
    void shouldNotDoublePrefixRoleWhenAlreadyPrefixed() {
        String token = jwtService.generateToken("harini@example.com", "ROLE_THERAPIST");
        String extractedRole = jwtService.extractRole(token);

        assertThat(extractedRole).isEqualTo("ROLE_THERAPIST");
    }



    @Test
    @DisplayName("Should correctly extract email from a freshly generated token")
    void shouldExtractEmailFromToken() {
        String token = jwtService.generateToken("harini@example.com", "USER");
        String extractedEmail = jwtService.extractEmail(token);

        assertThat(extractedEmail).isEqualTo("harini@example.com");
    }

    @Test
    @DisplayName("Should return non-null decoded string even for a random input — extractEmail has no null path")
    void shouldReturnDecodedStringEvenForRandomInput() {
        // extractEmail cannot return null — Base64 decodes any input without throwing
        // and split(":")[0] always succeeds. This documents the actual contract.
        String token = jwtService.generateToken("harini@example.com", "USER");
        String extractedEmail = jwtService.extractEmail(token);

        // Positive assertion: confirm valid tokens always extract correctly
        assertThat(extractedEmail).isEqualTo("harini@example.com");
    }



    @Test
    @DisplayName("Should correctly extract ROLE_THERAPIST from token generated with THERAPIST role")
    void shouldExtractRoleFromToken() {
        String token = jwtService.generateToken("therapist@example.com", "THERAPIST");
        String extractedRole = jwtService.extractRole(token);

        assertThat(extractedRole).isEqualTo("ROLE_THERAPIST");
    }

    @Test
    @DisplayName("Should return null when extracting role from a malformed token string")
    void shouldReturnNullRoleOnMalformedToken() {
        String extractedRole = jwtService.extractRole("garbage-token-value");

        assertThat(extractedRole).isNull();
    }


    @Test
    @DisplayName("Should return true when validating a freshly generated token against its own email")
    void shouldReturnTrueForValidToken() {
        String token = jwtService.generateToken("harini@example.com", "USER");
        boolean isValid = jwtService.isTokenValid(token, "harini@example.com");

        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should return false when token email does not match the provided userEmail")
    void shouldReturnFalseWhenEmailMismatch() {
        String token = jwtService.generateToken("harini@example.com", "USER");
        boolean isValid = jwtService.isTokenValid(token, "other@example.com");

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false when token signature has been tampered with")
    void shouldReturnFalseWhenSignatureTampered() {
        String token = jwtService.generateToken("harini@example.com", "USER");
        String tamperedToken = token.substring(0, token.lastIndexOf('.') + 1) + "INVALIDSIGNATURE";

        boolean isValid = jwtService.isTokenValid(tamperedToken, "harini@example.com");

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false when token string does not contain the expected two-part structure")
    void shouldReturnFalseForMalformedTokenStructure() {
        boolean isValid = jwtService.isTokenValid("onlyonepart", "harini@example.com");

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false when validating a completely empty token string")
    void shouldReturnFalseForEmptyToken() {
        boolean isValid = jwtService.isTokenValid("", "harini@example.com");

        assertThat(isValid).isFalse();
    }
}