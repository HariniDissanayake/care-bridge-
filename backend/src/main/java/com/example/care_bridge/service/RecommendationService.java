package com.example.care_bridge.service;

import com.example.care_bridge.model.Recommendation;
import com.example.care_bridge.repository.RecommendationRepository;
import com.example.care_bridge.repository.TherapistProfileRepository;
import com.example.care_bridge.repository.UserRepository;
import com.example.care_bridge.user.entity.TherapistProfile;
import com.example.care_bridge.user.entity.User;
import com.example.care_bridge.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final TherapistProfileRepository therapistProfileRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    // @Transactional keeps the Hibernate session open so Jackson can
    // safely access lazy-loaded user/therapist fields during serialization
    @Transactional(readOnly = true)
    public List<Recommendation> getReviewsForTherapist(Long therapistId) {
        return recommendationRepository.findByTherapistIdOrderByCreatedAtDesc(therapistId);
    }

    @Transactional
    public Recommendation createReview(Long therapistId, String token, double rating, String comment) {
        String email = jwtService.extractEmail(token);

        if (email == null) {
            throw new IllegalArgumentException("Invalid or expired token.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        TherapistProfile therapist = therapistProfileRepository.findById(therapistId)
                .orElseThrow(() -> new IllegalArgumentException("Therapist not found with id: " + therapistId));

        Recommendation review = new Recommendation();
        review.setTherapist(therapist);
        review.setUser(user);
        review.setRating(rating);
        review.setComment(comment);

        return recommendationRepository.save(review);
    }
}