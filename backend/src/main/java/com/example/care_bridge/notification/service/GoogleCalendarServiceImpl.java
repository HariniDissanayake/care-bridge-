package com.example.care_bridge.notification.service;

import com.example.care_bridge.booking.entity.Booking;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime; // 🚀 Added import
import java.time.ZoneId;
import java.util.Arrays;

@Service
public class GoogleCalendarServiceImpl implements GoogleCalendarService {

    @Autowired(required = false)
    private Calendar googleCalendarClient;

    @Override
    public String createConferenceEvent(Booking booking) {
        if (googleCalendarClient == null) {
            return "https://meet.google.com/abc-mock-meet-link";
        }

        try {
            // 🚀 FIX: Parse the String times into LocalTime instances so .atTime() compiles perfectly
            LocalTime startLocalTime = LocalTime.parse(booking.getStartTime());
            LocalTime endLocalTime = LocalTime.parse(booking.getEndTime());

            // 🚀 FIX: Convert to Instant using atZone()
            long startEpoch = booking.getBookingDate().atTime(startLocalTime)
                    .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

            long endEpoch = booking.getBookingDate().atTime(endLocalTime)
                    .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

            Event event = new Event()
                    .setSummary("CareBridge Consultation: " + booking.getTherapist().getTitle() + " " + booking.getTherapist().getUser().getLastName())
                    .setDescription("Telehealth therapy session. Patient Notes: " + booking.getClientNotes());

            event.setStart(new EventDateTime().setDateTime(new DateTime(startEpoch)));
            event.setEnd(new EventDateTime().setDateTime(new DateTime(endEpoch)));

            EventAttendee[] attendees = new EventAttendee[] {
                    new EventAttendee().setEmail(booking.getClient().getEmail()).setResponseStatus("accepted"),
                    new EventAttendee().setEmail(booking.getTherapist().getUser().getEmail())
            };
            event.setAttendees(Arrays.asList(attendees));

            ConferenceSolutionKey conferenceSolutionKey = new ConferenceSolutionKey().setType("hangoutMeeting");
            CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest()
                    .setRequestId("carebridge-" + booking.getId())
                    .setConferenceSolutionKey(conferenceSolutionKey);

            event.setConferenceData(new ConferenceData().setCreateRequest(createConferenceRequest));

            Event createdEvent = googleCalendarClient.events().insert("primary", event)
                    .setConferenceDataVersion(1)
                    .execute();

            return createdEvent.getConferenceData().getEntryPoints().get(0).getUri();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Google Calendar event or Meet link", e);
        }
    }
}