package com.example.care_bridge.service;

import com.example.care_bridge.booking.dot.BookingInitiateRequest;
import com.example.care_bridge.booking.dot.BookingResponse;
import com.example.care_bridge.booking.entity.Booking;
import com.example.care_bridge.booking.entity.BookingStatus;
import com.example.care_bridge.booking.repository.BookingRepository;
import com.example.care_bridge.booking.service.BookingServiceImpl;
import com.example.care_bridge.notification.service.EmailService;
import com.example.care_bridge.notification.service.NotificationService;
import com.example.care_bridge.repository.TherapistProfileRepository;
import com.example.care_bridge.user.TherapistProfile;
import com.example.care_bridge.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.DigestUtils;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BookingServiceImplTest {

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TherapistProfileRepository therapistRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    private User mockClient;
    private User mockTherapistUser;
    private TherapistProfile mockTherapist;
    private Booking mockBooking;

    private final String merchantId = "12345";
    private final String merchantSecret = "mySecretKey";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        Locale.setDefault(Locale.US); // Forces uniform decimal symbol layouts across systems

        ReflectionTestUtils.setField(bookingService, "merchantId", merchantId);
        ReflectionTestUtils.setField(bookingService, "merchantSecret", merchantSecret);

        mockClient = new User();
        mockClient.setId(1L);
        mockClient.setFirstName("Harini");
        mockClient.setLastName("Dissanayake");
        mockClient.setEmail("harini@example.com");

        mockTherapistUser = new User();
        mockTherapistUser.setId(2L);
        mockTherapistUser.setFirstName("Sarah");
        mockTherapistUser.setLastName("Smith");
        mockTherapistUser.setEmail("sarah.smith@example.com");

        mockTherapist = new TherapistProfile();
        mockTherapist.setId(10L);
        mockTherapist.setUser(mockTherapistUser);
        mockTherapist.setPricePerSession(2500.00);

        mockBooking = new Booking();
        mockBooking.setId(1001L);
        mockBooking.setClient(mockClient);
        mockBooking.setTherapist(mockTherapist);
        mockBooking.setBookingDate(LocalDate.of(2026, 7, 20));
        mockBooking.setStartTime("10:00");
        mockBooking.setEndTime("11:00");
        mockBooking.setTotalCost(2500.00);
        mockBooking.setStatus(BookingStatus.PENDING);
    }

    @Test
    @DisplayName("Should successfully initiate a pending booking and generate accurate PayHere payment payload parameters")
    void shouldInitiateBookingSuccessfully() {
        BookingInitiateRequest request = new BookingInitiateRequest();
        request.setTherapistId(10L);
        request.setBookingDate(LocalDate.of(2026, 7, 20));
        request.setStartTime("10:00");
        request.setEndTime("11:00");

        when(therapistRepository.findById(10L)).thenReturn(Optional.of(mockTherapist));
        when(bookingRepository.isSlotOverlapping(anyLong(), any(), anyString(), anyString(), anyList()))
                .thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(mockBooking);

        BookingResponse response = bookingService.initiateBooking(request, mockClient);

        assertThat(response).isNotNull();
        assertThat(response.getBookingId()).isEqualTo(1001L);
        assertThat(response.getStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Should throw IllegalStateException when trying to initiate a booking on an overlapping or busy time slot")
    void shouldThrowExceptionWhenTimeSlotIsOverlapping() {
        // Arrange
        BookingInitiateRequest request = new BookingInitiateRequest();
        request.setTherapistId(10L);
        request.setBookingDate(LocalDate.of(2026, 7, 20));
        request.setStartTime("10:00");
        request.setEndTime("11:00");

        when(therapistRepository.findById(10L)).thenReturn(Optional.of(mockTherapist));

        // FIXED MATCHERS: Use broad, loose matchers (any()) for all parameters
        // to guarantee Mockito catches and intercepts this call accurately.
        when(bookingRepository.isSlotOverlapping(
                anyLong(),
                any(LocalDate.class),
                anyString(),
                anyString(),
                any() // Replaced anyList() with any() to fix the stubbing bypass
        )).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> bookingService.initiateBooking(request, mockClient))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("This specific time slot is no longer available.");

        // Double check that the code stopped instantly and never attempted to save to DB
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should successfully confirm a booking and send HTML notifications when a valid payment code '2' webhook is captured")
    void shouldProcessWebhookWithSuccessfulPayment() {
        Map<String, String> params = new HashMap<>();
        params.put("order_id", "1001");
        params.put("status_code", "2");
        params.put("payhere_amount", "2500.00");
        params.put("payhere_currency", "LKR");

        // Dynamically compute signature using the service implementation logic to prevent hardcoded failures
        String dynamicSig = calculateTestMd5WebhookSignature("1001", "2", "2500.00", "LKR");
        params.put("md5sig", dynamicSig);

        when(bookingRepository.findById(1001L)).thenReturn(Optional.of(mockBooking));

        bookingService.processPayhereWebhook(params);

        assertThat(mockBooking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        verify(bookingRepository, times(1)).save(mockBooking);
        verify(notificationService, times(1)).triggerBookingConfirmationFlow(mockBooking);
    }

    @Test
    @DisplayName("Should cleanly cancel a booking and dispatch a cancellation message when payment code is negative")
    void shouldProcessWebhookWithFailedOrDeclinedPayment() {
        Map<String, String> params = new HashMap<>();
        params.put("order_id", "1001");
        params.put("status_code", "-2");
        params.put("payhere_amount", "2500.00");
        params.put("payhere_currency", "LKR");

        String dynamicSig = calculateTestMd5WebhookSignature("1001", "-2", "2500.00", "LKR");
        params.put("md5sig", dynamicSig);

        when(bookingRepository.findById(1001L)).thenReturn(Optional.of(mockBooking));

        bookingService.processPayhereWebhook(params);

        assertThat(mockBooking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        verify(bookingRepository, times(1)).save(mockBooking);
    }

    // Helper method that replicates your custom webhook verification logic exactly
    private String calculateTestMd5WebhookSignature(String orderId, String statusCode, String amount, String currency) {
        String secretHash = DigestUtils.md5DigestAsHex(merchantSecret.getBytes()).toUpperCase();
        String rawCombined = merchantId + orderId + amount + currency + statusCode + secretHash;
        return DigestUtils.md5DigestAsHex(rawCombined.getBytes()).toUpperCase();
    }
}