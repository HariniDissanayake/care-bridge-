package com.example.care_bridge.repository;


import com.example.care_bridge.model.Recommendation; // Make sure this matches your model package!
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    // This custom query method handles fetching reviews for a specific therapist
    List<Recommendation> findByTherapistIdOrderByCreatedAtDesc(Long therapistId);
}