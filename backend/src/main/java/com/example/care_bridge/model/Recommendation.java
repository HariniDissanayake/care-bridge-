package com.example.care_bridge.model;

import com.example.care_bridge.user.entity.TherapistProfile;
import com.example.care_bridge.user.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
@Getter
@Setter
// Use @Getter/@Setter instead of @Data on JPA entities —
// @Data generates equals/hashCode using all fields which breaks
// Hibernate proxy equality and causes lazy-load issues
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tells Jackson: when serializing TherapistProfile inside a review,
    // only include these fields — don't try to traverse the whole graph
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "therapist_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "workSchedule", "specialties", "education", "user",
            "bio", "imageUrl", "consultationType", "contactMethod"})
    private TherapistProfile therapist;

    // For the user, only expose firstName + lastName to the frontend
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "password", "email", "phone", "role", "therapistProfile"})
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comment;

    private double rating;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}