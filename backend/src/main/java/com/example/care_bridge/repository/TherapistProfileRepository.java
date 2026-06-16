package com.example.care_bridge.repository;

import com.example.care_bridge.user.entity.TherapistProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TherapistProfileRepository extends JpaRepository<TherapistProfile, Long> {

    // Overriding the default findAll to join the User details upfront
    @Override
    @Query("SELECT DISTINCT t FROM TherapistProfile t JOIN FETCH t.user")
    List<TherapistProfile> findAll();

    // Filter by specialization OR collection tags cleanly with a User join fetch
    @Query("""
        SELECT DISTINCT t FROM TherapistProfile t
        JOIN FETCH t.user
        LEFT JOIN t.specialties s
        WHERE LOWER(t.specialization) LIKE LOWER(CONCAT('%', :specialty, '%'))
           OR LOWER(s) LIKE LOWER(CONCAT('%', :specialty, '%'))
    """)
    List<TherapistProfile> findBySpecialty(@Param("specialty") String specialty);

    /**
     * Optimized single profile lookup query.
     * Uses EntityGraph to eagerly load the OneToOne User relation upfront.
     * The List collections are cleanly managed by FetchMode.SUBSELECT on the entity
     * to eliminate the MultipleBagFetchException.
     */
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT t FROM TherapistProfile t WHERE t.id = :id")
    Optional<TherapistProfile> findByIdWithDetails(@Param("id") Long id);
}