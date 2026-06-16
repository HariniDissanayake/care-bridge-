package com.example.care_bridge.booking.service;

import com.example.care_bridge.booking.dot.BookingInitiateRequest;
import com.example.care_bridge.booking.dot.BookingResponse;
import com.example.care_bridge.booking.entity.Booking;
import com.example.care_bridge.booking.repository.BookingRepository;
import com.example.care_bridge.user.entity.User;
import java.util.Map;

public interface BookingService {
    BookingResponse initiateBooking(BookingInitiateRequest request, User currentUser);
    void processPayhereWebhook(Map<String, String> params);

    // ADD THIS METHOD CONTRACT HERE
    BookingResponse getBookingById(Long bookingId, User currentUser);
}