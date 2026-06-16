package com.example.care_bridge.notification.service;

import com.example.care_bridge.booking.entity.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private GoogleCalendarService calendarService;

    @Autowired
    private EmailService emailService;

    @Override
    @Async("getAsyncExecutor") // References the custom background thread pool we built in AsyncConfig
    public void triggerBookingConfirmationFlow(Booking booking) {

        // 1. Generate Google Meet video bridge link via Calendar infrastructure integrations
        String meetUrl = calendarService.createConferenceEvent(booking);

        // Save the link straight to our core booking database record entry
        booking.setGoogleMeetUrl(meetUrl);

        // Date / Time visual layout formatting values strings
        String formattedDate = booking.getBookingDate().format(DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy"));

        // FIXED: Safely parse String fields into LocalTime objects before formatting them
        // Note: This assumes your strings are stored in standard 24-hour ISO format (e.g., "14:30" or "14:30:00").
        String formattedTime = LocalTime.parse(booking.getStartTime()).format(DateTimeFormatter.ofPattern("hh:mm a")) + " - " +
                LocalTime.parse(booking.getEndTime()).format(DateTimeFormatter.ofPattern("hh:mm a"));

        // 2. DISPATCH STYLED NOTIFICATION TO PATIENT/USER
        String userSubject = "Appointment Confirmed - CareBridge Session";
        String userHtml = "<html><body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>"
                + "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>"
                + "<h2 style='color: #0d6efd;'>Your Session is Booked!</h2>"
                + "<p>Hi " + booking.getClient().getFirstName() + ",</p>"
                + "<p>Your payment through PayHere was processed successfully. Take a deep breath—your path to wellness is secured.</p>"
                + "<h3>Session Summary</h3>"
                + "<ul>"
                + "  <li><strong>Therapist:</strong> " + booking.getTherapist().getTitle() + " " + booking.getTherapist().getUser().getLastName() + "</li>"
                + "  <li><strong>Date & Time:</strong> " + formattedDate + " at " + formattedTime + "</li>"
                + "  <li><strong>Format:</strong> " + booking.getSessionFormat() + " (" + booking.getAppointmentType() + ")</li>"
                + "</ul>"
                + "<div style='margin: 30px 0; text-align: center;'>"
                + "  <a href='" + meetUrl + "' style='background-color: #007A78; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;'>Join Video Session</a>"
                + "</div>"
                + "<p style='font-size: 12px; color: #777;'>A Google Calendar invitation has also been added automatically to your inbox calendar feed.</p>"
                + "</div></body></html>";

        emailService.sendHtmlEmail(booking.getClient().getEmail(), userSubject, userHtml);

        // 3. DISPATCH NOTIFICATION TO THERAPIST
        String therapistSubject = "New Booking Alert - CareBridge Platform";
        String therapistHtml = "<html><body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>"
                + "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>"
                + "<h2 style='color: #007A78;'>New Session Scheduled</h2>"
                + "<p>Hello " + booking.getTherapist().getTitle() + " " + booking.getTherapist().getUser().getLastName() + ",</p>"
                + "<p>A new consultation slot has been booked and confirmed by a client on your CareBridge profile dashboard.</p>"
                + "<h3>Appointment Details</h3>"
                + "<ul>"
                + "  <li><strong>Patient Name:</strong> " + booking.getClient().getFirstName() + " " + booking.getClient().getLastName() + "</li>"
                + "  <li><strong>Date & Time:</strong> " + formattedDate + " at " + formattedTime + "</li>"
                + "  <li><strong>Format:</strong> " + booking.getSessionFormat() + "</li>"
                + "  <li><strong>Patient Notes:</strong> " + (booking.getClientNotes() != null ? booking.getClientNotes() : "None provided") + "</li>"
                + "</ul>"
                + "<div style='margin: 30px 0; text-align: center;'>"
                + "  <a href='" + meetUrl + "' style='background-color: #2b3e50; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;'>Open Consultation Room</a>"
                + "</div>"
                + "</div></body></html>";

        emailService.sendHtmlEmail(booking.getTherapist().getUser().getEmail(), therapistSubject, therapistHtml);
    }
}