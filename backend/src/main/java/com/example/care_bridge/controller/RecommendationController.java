package com.example.care_bridge.controller;

import com.example.care_bridge.model.Recommendation;
import com.example.care_bridge.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

    private final RecommendationService recommendationService;

    // GET all reviews for a therapist
    // URL: GET http://localhost:8080/api/therapists/{therapistId}/reviews
    @GetMapping("/api/therapists/{therapistId}/reviews")
    public ResponseEntity<List<Recommendation>> getReviews(@PathVariable Long therapistId) {
        return ResponseEntity.ok(recommendationService.getReviewsForTherapist(therapistId));
    }

    // POST a new review for a therapist (requires auth token)
    // URL: POST http://localhost:8080/api/therapists/{therapistId}/reviews
    // Body: { "rating": 4.5, "comment": "Great therapist!" }
    @PostMapping("/api/therapists/{therapistId}/reviews")
    public ResponseEntity<?> createReview(
            @PathVariable Long therapistId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("You must be signed in to leave a review.");
        }

        String token = authHeader.substring(7);
        double rating = Double.parseDouble(body.get("rating").toString());
        String comment = body.get("comment").toString();

        try {
            Recommendation saved = recommendationService.createReview(therapistId, token, rating, comment);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not save review.");
        }
    }
}