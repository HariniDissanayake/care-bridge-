package com.example.care_bridge.notification.service;

import com.example.care_bridge.booking.entity.Booking;

public interface GoogleCalendarService {
    /**
     * Creates a Google Calendar event, injects both attendees,
     * auto-generates a Google Meet link, and returns the Meet URL.
     */
    String createConferenceEvent(Booking booking);
}