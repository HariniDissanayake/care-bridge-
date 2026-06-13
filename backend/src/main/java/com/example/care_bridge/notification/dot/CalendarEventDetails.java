package com.example.care_bridge.notification.dto;

public class CalendarEventDetails {
    private String summary;
    private String description;
    private String startDateTimeIso;
    private String endDateTimeIso;
    private String attendeeEmails;

    // Getters and Setters
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStartDateTimeIso() { return startDateTimeIso; }
    public void setStartDateTimeIso(String startDateTimeIso) { this.startDateTimeIso = startDateTimeIso; }

    public String getEndDateTimeIso() { return endDateTimeIso; }
    public void setEndDateTimeIso(String endDateTimeIso) { this.endDateTimeIso = endDateTimeIso; }

    public String getAttendeeEmails() { return attendeeEmails; }
    public void setAttendeeEmails(String attendeeEmails) { this.attendeeEmails = attendeeEmails; }
}