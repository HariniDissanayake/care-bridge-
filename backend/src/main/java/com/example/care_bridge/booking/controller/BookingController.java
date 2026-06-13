package com.example.care_bridge.booking.controller;

import com.example.care_bridge.booking.dot.BookingInitiateRequest;
import com.example.care_bridge.booking.dot.BookingResponse;
import com.example.care_bridge.booking.service.BookingService;
import com.example.care_bridge.repository.UserRepository;
import com.example.care_bridge.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")   // fixed: was /api/v1/bookings, frontend calls /api/bookings
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiateBooking(@RequestBody BookingInitiateRequest request) {

        // Get the email set by JwtAuthenticationFilter as the principal
        String email = (String) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        // Load the real User entity from the database
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));

        BookingResponse response = bookingService.initiateBooking(request, currentUser);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(@PathVariable Long id) {

        String email = (String) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));

        BookingResponse response = bookingService.getBookingById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    // PayHere sends a form-encoded POST to this webhook after payment
    @PostMapping(value = "/payhere-notify", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> handlePayhereNotification(@RequestParam Map<String, String> requestParams) {
        bookingService.processPayhereWebhook(requestParams);
        return ResponseEntity.ok().build();
    }
}