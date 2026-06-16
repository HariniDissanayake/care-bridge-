package com.example.care_bridge.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private String firstName;  // ← add
    private String lastName;   // ← add
}