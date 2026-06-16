package com.example.care_bridge.auth;



import com.example.care_bridge.auth.dto.AuthResponse;
import com.example.care_bridge.auth.dto.LoginRequest;
import com.example.care_bridge.auth.dto.RegisterRequest;
import com.example.care_bridge.user.entity.TherapistProfile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    // ADD THIS NEW ENDPOINT TO MATCH YOUR FRONTEND REQUEST
    @PostMapping("/register-therapist")
    public ResponseEntity<String> registerTherapist(@RequestBody RegisterRequest request) {
        // Explicitly enforce that anyone registering here gets the THERAPIST role
        request.setRole(com.example.care_bridge.user.entity.Role.THERAPIST);

        // Pass it to your updated service which handles saving the user + profile safely
        String response = authService.register(request);

        return ResponseEntity.ok(response);
    }
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}