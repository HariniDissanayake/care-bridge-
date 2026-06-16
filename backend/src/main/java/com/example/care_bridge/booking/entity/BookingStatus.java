package com.example.care_bridge.booking.entity;


public enum BookingStatus {
    PENDING,       // Client initiated checkout; slot temporarily blocked
    CONFIRMED,     // PayHere webhook verified success; emails sent
    CANCELLED,     // Payment failed or dropped
    COMPLETED
}
