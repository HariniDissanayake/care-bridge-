package com.example.care_bridge.service;

import com.example.care_bridge.config.JwtService;
import com.example.care_bridge.recommendation.model.Recommendation;
import com.example.care_bridge.recommendation.repository.RecommendationRepository;
import com.example.care_bridge.recommendation.service.RecommendationService;
import com.example.care_bridge.repository.TherapistProfileRepository;
import com.example.care_bridge.repository.UserRepository;
import com.example.care_bridge.user.TherapistProfile;
import com.example.care_bridge.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private RecommendationRepository recommendationRepository;

    @Mock
    private TherapistProfileRepository therapistProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private RecommendationService recommendationService;

    private User sampleUser;
    private TherapistProfile sampleTherapist;
    private Recommendation sampleReview;
    private final String validToken = "mocked-jwt-token";
    private final String userEmail = "user@example.com";

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setEmail(userEmail);

        sampleTherapist = new TherapistProfile();
        sampleTherapist.setId(20L);
        sampleTherapist.setTitle("Dr. Smith");

        sampleReview = new Recommendation();
        sampleReview.setId(100L);
        sampleReview.setUser(sampleUser);
        sampleReview.setTherapist(sampleTherapist);
        sampleReview.setRating(4.5);
        sampleReview.setComment("Excellent listener!");
    }

    // ==========================================
    // GET REVIEWS TESTS
    // ==========================================
    @Nested
    @DisplayName("Get Reviews For Therapist Tests")
    class GetReviewsTests {

        @Test
        @DisplayName("Should return list of reviews sorted by creation date")
        void shouldReturnReviewsForTherapist() {
            // Arrange
            when(recommendationRepository.findByTherapistIdOrderByCreatedAtDesc(20L))
                    .thenReturn(List.of(sampleReview));

            // Act
            List<Recommendation> results = recommendationService.getReviewsForTherapist(20L);

            // Assert
            assertThat(results).hasSize(1);
            assertThat(results.get(0).getComment()).isEqualTo("Excellent listener!");
            verify(recommendationRepository, times(1)).findByTherapistIdOrderByCreatedAtDesc(20L);
        }
    }

    // ==========================================
    // CREATE REVIEW TESTS
    // ==========================================
    @Nested
    @DisplayName("Create Review Tests")
    class CreateReviewTests {

        @Test
        @DisplayName("Should successfully save review when inputs and token are valid")
        void shouldCreateReviewSuccessfully() {
            // Arrange
            when(jwtService.extractEmail(validToken)).thenReturn(userEmail);
            when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(sampleUser));
            when(therapistProfileRepository.findById(20L)).thenReturn(Optional.of(sampleTherapist));
            when(recommendationRepository.save(any(Recommendation.class))).thenReturn(sampleReview);

            // Act
            Recommendation result = recommendationService.createReview(20L, validToken, 4.5, "Excellent listener!");

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getRating()).isEqualTo(4.5);
            assertThat(result.getComment()).isEqualTo("Excellent listener!");
            assertThat(result.getUser().getEmail()).isEqualTo(userEmail);
            assertThat(result.getTherapist().getTitle()).isEqualTo("Dr. Smith");

            verify(jwtService, times(1)).extractEmail(validToken);
            verify(userRepository, times(1)).findByEmail(userEmail);
            verify(therapistProfileRepository, times(1)).findById(20L);
            verify(recommendationRepository, times(1)).save(any(Recommendation.class));
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when token is invalid or expired")
        void shouldThrowExceptionWhenTokenIsInvalid() {
            // Arrange
            when(jwtService.extractEmail("invalid-token")).thenReturn(null);

            // Act & Assert
            assertThatThrownBy(() -> recommendationService.createReview(20L, "invalid-token", 5.0, "Great!"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid or expired token.");

            verify(jwtService, times(1)).extractEmail("invalid-token");
            verifyNoInteractions(userRepository, therapistProfileRepository, recommendationRepository);
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when token email doesn't match a user")
        void shouldThrowExceptionWhenUserNotFound() {
            // Arrange
            when(jwtService.extractEmail(validToken)).thenReturn(userEmail);
            when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> recommendationService.createReview(20L, validToken, 5.0, "Great!"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("User not found.");

            verify(userRepository, times(1)).findByEmail(userEmail);
            verifyNoInteractions(therapistProfileRepository, recommendationRepository);
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when therapist ID doesn't exist")
        void shouldThrowExceptionWhenTherapistNotFound() {
            // Arrange
            when(jwtService.extractEmail(validToken)).thenReturn(userEmail);
            when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(sampleUser));
            when(therapistProfileRepository.findById(99L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> recommendationService.createReview(99L, validToken, 5.0, "Great!"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Therapist not found with id: 99");

            verify(therapistProfileRepository, times(1)).findById(99L);
            verifyNoInteractions(recommendationRepository);
        }
    }
}