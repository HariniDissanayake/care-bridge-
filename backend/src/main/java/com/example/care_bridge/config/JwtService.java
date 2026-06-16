package com.example.care_bridge.config;

import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class JwtService {

    private static final String SECRET_KEY = "CareBridgeSuperSecretSecurityKeyForManualTokensHashingLocal";

    private static final long EXPIRATION_TIME = 7L * 24 * 60 * 60 * 1000; // 7 days

    public String generateToken(String email, String role) {
        long now        = System.currentTimeMillis();
        long expiryTime = now + EXPIRATION_TIME;

        String formattedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
        String payload       = email + ":" + formattedRole + ":" + expiryTime;

        System.out.println("[JWT] Generating token:");
        System.out.println("[JWT] Now       : " + now);
        System.out.println("[JWT] Expiry    : " + expiryTime);
        System.out.println("[JWT] Role      : " + formattedRole);

        String base64Payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signature     = generateHmacSignature(base64Payload);

        return base64Payload + "." + signature;
    }

    public String extractEmail(String token) {
        try {
            String[] parts = token.split("\\.");
            String decodedPayload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            return decodedPayload.split(":")[0];
        } catch (Exception e) {
            return null;
        }
    }

    public String extractRole(String token) {
        try {
            String[] parts = token.split("\\.");
            String decodedPayload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            return decodedPayload.split(":")[1]; // Will correctly include "ROLE_XYZ"
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isTokenValid(String token, String userEmail) {
        try {
            String[] parts = token.split("\\.");

            if (parts.length != 2) {
                System.out.println("[JWT] Invalid format — parts: " + parts.length);
                return false;
            }

            String base64Payload     = parts[0];
            String incomingSignature = parts[1];

            String expectedSignature = generateHmacSignature(base64Payload);
            if (!expectedSignature.equals(incomingSignature)) {
                System.out.println("[JWT] Signature mismatch");
                return false;
            }

            String decodedPayload = new String(
                    Base64.getUrlDecoder().decode(base64Payload), StandardCharsets.UTF_8
            );
            System.out.println("[JWT] Decoded payload: " + decodedPayload);

            // Split into max 3 parts to safely handle email format
            String[] data = decodedPayload.split(":", 3);
            if (data.length < 3) {
                System.out.println("[JWT] Payload malformed — got: " + data.length + " parts");
                return false;
            }

            String email      = data[0];
            long   expiryTime = Long.parseLong(data[2]);

            boolean emailMatch = email.equalsIgnoreCase(userEmail);
            boolean isExpired  = System.currentTimeMillis() > expiryTime;

            System.out.println("[JWT] Email match: " + emailMatch + " | Expired: " + isExpired);

            return emailMatch && !isExpired;

        } catch (Exception e) {
            System.out.println("[JWT] Exception: " + e.getMessage());
            return false;
        }
    }

    private String generateHmacSignature(String data) {
        try {
            Mac hmacSha256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmacSha256.init(secretKeySpec);
            byte[] hashBytes = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate secure custom signature", e);
        }
    }
}