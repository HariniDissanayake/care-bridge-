package com.example.care_bridge.booking.dot;

import java.time.LocalDate;
import java.time.LocalTime;

public class BookingInitiateRequest {
    private Long therapistId;
    private LocalDate bookingDate;
    private String startTime;
    private String endTime;
    private String clientNotes;
    private String sessionFormat;      // e.g., "Video Consultation"
    private String appointmentType;     // e.g., "Initial Intake Session"

    // Getters and Setters
    public Long getTherapistId() { return therapistId; }
    public void setTherapistId(Long therapistId) { this.therapistId = therapistId; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getClientNotes() { return clientNotes; }
    public void setClientNotes(String clientNotes) { this.clientNotes = clientNotes; }
    public String getSessionFormat() { return sessionFormat; }
    public void setSessionFormat(String sessionFormat) { this.sessionFormat = sessionFormat; }
    public String getAppointmentType() { return appointmentType; }
    public void setAppointmentType(String appointmentType) { this.appointmentType = appointmentType; }


}