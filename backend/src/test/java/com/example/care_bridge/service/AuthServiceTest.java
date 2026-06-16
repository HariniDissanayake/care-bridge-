package com.example.care_bridge.service;



import com.example.care_bridge.auth.dto.AuthResponse;
import com.example.care_bridge.auth.dto.LoginRequest;
import com.example.care_bridge.auth.dto.RegisterRequest;
import com.example.care_bridge.auth.service.AuthService;
import com.example.care_bridge.config.JwtService;
import com.example.care_bridge.repository.UserRepository;
import com.example.care_bridge.user.TherapistProfile;
import com.example.care_bridge.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private User mockUser;
    private RegisterRequest baseRegisterRequest;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Setup common test context data structures
        mockUser = new User();
        mockUser.setId(101L);
        mockUser.setFirstName("Harini");
        mockUser.setLastName("Dissanayake");
        mockUser.setEmail("harini@example.com");
        mockUser.setPassword("encodedSecretHash");
        mockUser.setRole(User.Role.USER);

        baseRegisterRequest = new RegisterRequest();
        baseRegisterRequest.setFirstName("Harini");
        baseRegisterRequest.setLastName("Dissanayake");
        baseRegisterRequest.setEmail("harini@example.com");
        baseRegisterRequest.setPassword("plainPassword123");
        baseRegisterRequest.setPhone("0712345678");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTRATION WORKFLOW TESTS
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Should successfully capture registration parameters and map default USER role when no role is explicitly assigned")
    void shouldRegisterStandardUserSuccessfully() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedSecretHash");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act
        String result = authService.register(baseRegisterRequest);

        // Assert
        assertThat(result).isEqualTo("User registration completed successfully");

        // Deeply inspect fields mapping across entities via Mockito Captor
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getFirstName()).isEqualTo("Harini");
        assertThat(capturedUser.getEmail()).isEqualTo("harini@example.com");
        assertThat(capturedUser.getPassword()).isEqualTo("encodedSecretHash");
        assertThat(capturedUser.getRole()).isEqualTo(User.Role.USER); // Asserts fallback default condition logic
        assertThat(capturedUser.getTherapistProfile()).isNull();
    }

    @Test
    @DisplayName("Should establish bidirectionally linked internal properties between user and profile when registering a THERAPIST role")
    void shouldRegisterTherapistWithProfileLinkedCorrectly() {
        // Arrange
        baseRegisterRequest.setRole(User.Role.THERAPIST);
        TherapistProfile submittedProfile = new TherapistProfile();
        submittedProfile.setPricePerSession(3000.00);
        baseRegisterRequest.setTherapistProfile(submittedProfile);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedSecretHash");

        // Act
        authService.register(baseRegisterRequest);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getRole()).isEqualTo(User.Role.THERAPIST);
        assertThat(capturedUser.getTherapistProfile()).isNotNull();

        // Check bidirectional binding references safety
        assertThat(capturedUser.getTherapistProfile().getUser()).isEqualTo(capturedUser);
        assertThat(capturedUser.getTherapistProfile().getPricePerSession()).isEqualTo(3000.00);
    }

    @Test
    @DisplayName("Should throw RuntimeException and skip password encoding stages entirely if the requested email registration prefix is active")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // Arrange
        when(userRepository.existsByEmail("harini@example.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(baseRegisterRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email is already registered!");

        // Security Guardrail Checks
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUTHENTICATION LOGIN WORKFLOW TESTS
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Should issue signed JWT application payload mapping properties on matching credentials validation")
    void shouldLoginSuccessfullyWithValidCredentials() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("harini@example.com");
        loginRequest.setPassword("plainPassword123");

        when(userRepository.findByEmail("harini@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtService.generateToken(anyString(), anyString())).thenReturn("mocked-jwt-string-token");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked-jwt-string-token");
        assertThat(response.getEmail()).isEqualTo("harini@example.com");
        assertThat(response.getRole()).isEqualTo("USER");
        assertThat(response.getFirstName()).isEqualTo("Harini");
    }
    @Test
    @DisplayName("Should throw RuntimeException and prevent JWT issuing routines when incoming email address reference mapping fails")
    void shouldThrowExceptionWhenLoginEmailNotFound() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("unknown@example.com", "password");
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email or password credentials");

        verify(jwtService, never()).generateToken(anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw RuntimeException when client credentials string password content hash verification matching fails")
    void shouldThrowExceptionWhenLoginPasswordMismatches() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("harini@example.com", "wrongPassword");

        when(userRepository.findByEmail("harini@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongPassword", "encodedSecretHash")).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email or password credentials");

        verify(jwtService, never()).generateToken(anyString(), anyString());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER RETRIEVAL HOOKS TESTS
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Should return valid matching user context properties when searching an active email account tracking index")
    void shouldReturnUserWhenEmailExists() {
        // Arrange
        when(userRepository.findByEmail("harini@example.com")).thenReturn(Optional.of(mockUser));

        // Act
        User foundUser = authService.getUserByEmail("harini@example.com");

        // Assert
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getEmail()).isEqualTo("harini@example.com");
    }

    @Test
    @DisplayName("Should throw RuntimeException when querying lookups for records that don't match data layer instances")
    void shouldThrowExceptionWhenUserEmailDoesNotExist() {
        // Arrange
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.getUserByEmail("missing@example.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }
}
