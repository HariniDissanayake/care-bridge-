package com.example.care_bridge.booking.dot;

import java.util.Map;

public class BookingResponse {
    private Long bookingId;
    private String status;
    private double totalCost;
    private Map<String, Object> payhereParams; // Contains MD5 hash, merchantId, etc. for frontend

    public BookingResponse(Long bookingId, String status, double totalCost, Map<String, Object> payhereParams) {
        this.bookingId = bookingId;
        this.status = status;
        this.totalCost = totalCost;
        this.payhereParams = payhereParams;
    }

    // Getters and Setters
    public Long getBookingId() { return bookingId; }
    public String getStatus() { return status; }
    public double getTotalCost() { return totalCost; }
    public Map<String, Object> getPayhereParams() { return payhereParams; }
}