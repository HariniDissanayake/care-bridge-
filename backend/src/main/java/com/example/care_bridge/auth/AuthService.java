package com.example.care_bridge.auth;

import com.example.care_bridge.auth.dto.AuthResponse;
import com.example.care_bridge.auth.dto.LoginRequest;
import com.example.care_bridge.auth.dto.RegisterRequest;
import com.example.care_bridge.config.JwtService;
import com.example.care_bridge.user.entity.TherapistProfile;
import com.example.care_bridge.user.entity.User;
import com.example.care_bridge.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.care_bridge.user.entity.Role;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public String register(RegisterRequest request) {
        // 1. Unique account check
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        // 2. Build core user entity
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.USER;
        user.setRole(assignedRole);

        // 3. Extract the nested profile directly from the request if the user is a THERAPIST
        if (assignedRole == Role.THERAPIST && request.getTherapistProfile() != null) {
            TherapistProfile profile = request.getTherapistProfile();

            // Link them together bi-directionally
            profile.setUser(user);
            user.setTherapistProfile(profile);
        }

        // 4. Persistence execution (Cascades cleanly down to profiles & collections)
        userRepository.save(user);
        return "User registration completed successfully";
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password credentials");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                user.getFirstName(),   // ← add
                user.getLastName()     // ← add
        );
    }
}