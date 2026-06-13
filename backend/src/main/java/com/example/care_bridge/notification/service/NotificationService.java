package com.example.care_bridge.notification.service;

import com.example.care_bridge.booking.entity.Booking;

public interface NotificationService {
    /**
     * Executes asynchronously in the background. Generates the video link,
     * syncs calendars, and notifies both participants.
     */
    void triggerBookingConfirmationFlow(Booking booking);
}