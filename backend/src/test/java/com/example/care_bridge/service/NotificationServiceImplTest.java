package com.example.care_bridge.service;

import com.example.care_bridge.booking.entity.Booking;

import com.example.care_bridge.notification.service.EmailService;
import com.example.care_bridge.notification.service.GoogleCalendarService;
import com.example.care_bridge.notification.service.NotificationServiceImpl;

import com.example.care_bridge.user.TherapistProfile;
import com.example.care_bridge.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NotificationServiceImplTest {

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Mock
    private GoogleCalendarService calendarService;

    @Mock
    private EmailService emailService;

    private Booking testBooking;
    private final String mockMeetUrl = "https://meet.google.com/abc-xyz-123";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // 1. Setup Mock User Entities
        User clientUser = new User();
        clientUser.setFirstName("John");
        clientUser.setLastName("Doe");
        clientUser.setEmail("john.doe@example.com");

        User client = new User();
        client.setFirstName("John");
        client.setLastName("Doe");
        client.setEmail("john.doe@example.com");
        client.setRole(clientUser.getRole());

        User therapistUser = new User();
        therapistUser.setFirstName("Sarah");
        therapistUser.setLastName("Smith");
        therapistUser.setEmail("sarah.smith@example.com");

        TherapistProfile therapist = new TherapistProfile();
        therapist.setTitle("Dr.");
        therapist.setUser(therapistUser);

        // 2. Setup Mock Booking Entity
        testBooking = new Booking();
        testBooking.setClient(client);
        testBooking.setTherapist(therapist);
        testBooking.setBookingDate(LocalDate.of(2026, 6, 15)); // Monday, June 15, 2026
        testBooking.setStartTime("14:30"); // ISO Format 24-hr
        testBooking.setEndTime("15:30");   // ISO Format 24-hr
        testBooking.setSessionFormat("Online");
        testBooking.setAppointmentType("Consultation");
        testBooking.setClientNotes("Feeling a bit anxious lately.");

        // Stub external calendar service integration call
        when(calendarService.createConferenceEvent(any(Booking.class))).thenReturn(mockMeetUrl);
    }

    @Test
    @DisplayName("Should successfully execute the entire confirmation sequence, update booking entity, and dispatch HTML notifications")
    void shouldTriggerBookingConfirmationFlowSuccessfully() {
        // Arrange
        ArgumentCaptor<String> emailCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> subjectCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> htmlBodyCaptor = ArgumentCaptor.forClass(String.class);

        // Act
        notificationService.triggerBookingConfirmationFlow(testBooking);

        // Assert
        // 1. Verify Google Meet Integration updates original Booking entity object references
        verify(calendarService, times(1)).createConferenceEvent(testBooking);
        assertThat(testBooking.getGoogleMeetUrl()).isEqualTo(mockMeetUrl);

        // 2. Capture arguments intercepted by email dispatcher engine
        verify(emailService, times(2)).sendHtmlEmail(
                emailCaptor.capture(),
                subjectCaptor.capture(),
                htmlBodyCaptor.capture()
        );

        List<String> capturedEmails = emailCaptor.getAllValues();
        List<String> capturedSubjects = subjectCaptor.getAllValues();
        List<String> capturedHtmls = htmlBodyCaptor.getAllValues();

        // 3. Validate Patient Email Layout Output
        assertThat(capturedEmails.get(0)).isEqualTo("john.doe@example.com");
        assertThat(capturedSubjects.get(0)).isEqualTo("Appointment Confirmed - CareBridge Session");
        assertThat(capturedHtmls.get(0))
                .contains("Hi John")
                .contains("Dr. Smith")
                .contains("Monday, June 15, 2026")
                .contains("02:30 PM - 03:30 PM") // Tests String -> LocalTime structural parsing transformations
                .contains(mockMeetUrl);

        // 4. Validate Therapist Email Layout Output
        assertThat(capturedEmails.get(1)).isEqualTo("sarah.smith@example.com");
        assertThat(capturedSubjects.get(1)).isEqualTo("New Booking Alert - CareBridge Platform");
        assertThat(capturedHtmls.get(1))
                .contains("Hello Dr. Smith")
                .contains("John Doe")
                .contains("Feeling a bit anxious lately.")
                .contains(mockMeetUrl);
    }

    @Test
    @DisplayName("Should substitute fallback placeholder when client notes parameter arrives null")
    void shouldHandleNullClientNotesGracefully() {
        // Arrange
        testBooking.setClientNotes(null);
        ArgumentCaptor<String> htmlBodyCaptor = ArgumentCaptor.forClass(String.class);

        // Act
        notificationService.triggerBookingConfirmationFlow(testBooking);

        // Assert
        verify(emailService, times(2)).sendHtmlEmail(any(), any(), htmlBodyCaptor.capture());
        String therapistHtml = htmlBodyCaptor.getAllValues().get(1); // Second invocation target

        assertThat(therapistHtml).contains("None provided");
    }
}