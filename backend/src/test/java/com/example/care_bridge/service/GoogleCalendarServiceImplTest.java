package com.example.care_bridge.service;


import com.example.care_bridge.booking.entity.Booking;

import com.example.care_bridge.notification.service.GoogleCalendarServiceImpl;

import com.example.care_bridge.user.TherapistProfile;
import com.example.care_bridge.user.User;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.EntryPoint;
import com.google.api.services.calendar.model.Event;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class GoogleCalendarServiceImplTest {

    @InjectMocks
    private GoogleCalendarServiceImpl googleCalendarService;

    @Mock
    private Calendar googleCalendarClient;

    // Google API nested chain mocks
    @Mock
    private Calendar.Events mockEvents;
    @Mock
    private Calendar.Events.Insert mockInsert;

    private Booking testBooking;
    private final String liveMeetUrl = "https://meet.google.com/xyz-pdq-abc";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // 1. Setup Mock Relationships
        User clientUser = new User();
        clientUser.setEmail("patient@example.com");
        User client = new User();
        client.setEmail("patient@example.com");
        client.setRole(clientUser.getRole());

        User therapistUser = new User();
        therapistUser.setEmail("therapist@example.com");
        TherapistProfile therapist = new TherapistProfile();
        therapist.setTitle("Dr.");
        therapist.setUser(therapistUser);

        // 2. Setup Base Booking Context
        testBooking = new Booking();
        testBooking.setId(99L);
        testBooking.setClient(client);
        testBooking.setTherapist(therapist);
        testBooking.setBookingDate(LocalDate.of(2026, 8, 20));
        testBooking.setStartTime("09:00"); // 9:00 AM ISO
        testBooking.setEndTime("10:00");   // 10:00 AM ISO
        testBooking.setClientNotes("Anxiety follow-up");
    }

    @Test
    @DisplayName("Should return mock fallback hyperlink when Google Calendar client bean is missing/disabled")
    void shouldReturnFallbackLinkWhenClientIsNull() {
        // Arrange
        GoogleCalendarServiceImpl standaloneService = new GoogleCalendarServiceImpl();
        // Leave client null inside target instance explicitly

        // Act
        String result = standaloneService.createConferenceEvent(testBooking);

        // Assert
        assertThat(result).isEqualTo("https://meet.google.com/abc-mock-meet-link");
    }

    @Test
    @DisplayName("Should parse timestamps and extract live Meet URI successfully when Google API returns valid response data")
    void shouldReturnLiveMeetUriOnSuccessfulApiExecution() throws IOException {
        // Arrange
        Event responseEvent = new Event();
        EntryPoint entryPoint = new EntryPoint().setUri(liveMeetUrl);
        ConferenceData conferenceData = new ConferenceData().setEntryPoints(Collections.singletonList(entryPoint));
        responseEvent.setConferenceData(conferenceData);

        // Deep mock stubbing for Google API fluent builders: client.events().insert("primary", event).setConferenceDataVersion(1).execute()
        when(googleCalendarClient.events()).thenReturn(mockEvents);
        when(mockEvents.insert(eq("primary"), any(Event.class))).thenReturn(mockInsert);
        when(mockInsert.setConferenceDataVersion(anyInt())).thenReturn(mockInsert);
        when(mockInsert.execute()).thenReturn(responseEvent);

        // Act
        String generatedUrl = googleCalendarService.createConferenceEvent(testBooking);

        // Assert
        assertThat(generatedUrl).isEqualTo(liveMeetUrl);

        // Verify structural initialization targets
        verify(mockEvents, times(1)).insert(eq("primary"), any(Event.class));
        verify(mockInsert, times(1)).execute();
    }

    @Test
    @DisplayName("Should wrap original exception within a custom RuntimeException if the underlying Google Client execution fails")
    void shouldThrowRuntimeExceptionWhenApiFails() throws IOException {
        // Arrange
        when(googleCalendarClient.events()).thenReturn(mockEvents);
        when(mockEvents.insert(anyString(), any(Event.class))).thenReturn(mockInsert);
        when(mockInsert.setConferenceDataVersion(anyInt())).thenReturn(mockInsert);

        // Simulating network disconnect or API credential validation error
        when(mockInsert.execute()).thenThrow(new IOException("API quota exceeded or network timeout"));

        // Act & Assert
        assertThatThrownBy(() -> googleCalendarService.createConferenceEvent(testBooking))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to generate Google Calendar event or Meet link");
    }
}
