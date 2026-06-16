package com.example.care_bridge.booking.repository;

import com.example.care_bridge.booking.entity.Booking;
import com.example.care_bridge.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.therapist.id = :therapistId " +
            "AND b.bookingDate = :date " +
            "AND b.status IN :statuses " +
            "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    boolean isSlotOverlapping(
            @Param("therapistId") Long therapistId,
            @Param("date") LocalDate date,
            @Param("startTime") String startTime,
            @Param("endTime") String endTime,
            @Param("statuses") List<BookingStatus> statuses
    );

    // FIXED: Changed b.user -> b.client to resolve the startup crash query exception
    @Query("""
        SELECT b FROM Booking b 
        JOIN FETCH b.client 
        JOIN FETCH b.therapist tp 
        JOIN FETCH tp.user 
        WHERE b.id = :id
    """)
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    // FIXED: Changed method name suffix from 'UserId' to 'ClientId' to match your Entity property
    List<Booking> findByClientIdOrderByBookingDateDesc(Long clientId);

    // PERFECT: Matches 'therapist' property mapping cleanly
    List<Booking> findByTherapistIdOrderByBookingDateAsc(Long therapistId);
}