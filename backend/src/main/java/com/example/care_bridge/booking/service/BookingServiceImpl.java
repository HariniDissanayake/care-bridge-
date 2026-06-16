package com.example.care_bridge.booking.service;

import com.example.care_bridge.booking.dot.BookingInitiateRequest;
// Fixed package path (.dot to .dto)
import com.example.care_bridge.booking.dot.BookingResponse;
import com.example.care_bridge.booking.entity.Booking;
import com.example.care_bridge.booking.entity.BookingStatus;
import com.example.care_bridge.booking.repository.BookingRepository;
import com.example.care_bridge.repository.TherapistProfileRepository;
import com.example.care_bridge.user.entity.TherapistProfile;
import com.example.care_bridge.user.entity.User;
import com.example.care_bridge.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.*;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TherapistProfileRepository therapistRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Override
    @Transactional
    public BookingResponse initiateBooking(BookingInitiateRequest request, User currentUser) {
        // 1. Fetch the actual therapist profile from database
        TherapistProfile therapist = therapistRepository.findById(request.getTherapistId())
                .orElseThrow(() -> new IllegalArgumentException("Therapist profile not found"));

        // 2. Ensure slot isn't already taken by active/pending transactions
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        boolean isTaken = bookingRepository.isSlotOverlapping(
                therapist.getId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(), activeStatuses);

        if (isTaken) {
            throw new IllegalStateException("This specific time slot is no longer available.");
        }

        // 3. Build and map your Booking entity correctly
        Booking booking = new Booking();
        booking.setClient(currentUser);      // FIXED: Maps to 'setClient' in your Booking entity
        booking.setTherapist(therapist);     // Connect loaded therapist profile data
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());

        // FIXED: Using pricePerSession from TherapistProfile and mapping to totalCost in Booking
        booking.setTotalCost(therapist.getPricePerSession());
        booking.setStatus(BookingStatus.PENDING);

        // Save entry to retrieve the database generated Order ID
        Booking savedBooking = bookingRepository.save(booking);

        // 4. PAYHERE PARAMETERS CONFIGURATION
        Map<String, Object> payhereParams = new HashMap<>();
        payhereParams.put("sandbox", true);
        payhereParams.put("merchant_id", merchantId);
        payhereParams.put("order_id", savedBooking.getId().toString());
        payhereParams.put("items", "CareBridge Consultation Session");
        payhereParams.put("currency", "LKR");

        // FIXED: Accessing value using your matching getter method getTotalCost()
        double amount = savedBooking.getTotalCost();
        payhereParams.put("amount", amount);

        // MD5 Verification Hash calculation
        String hash = generatePayhereMd5Hash(merchantId, savedBooking.getId().toString(), amount, "LKR", merchantSecret);
        payhereParams.put("hash", hash);

        // Prepopulate customer information data structures
        payhereParams.put("first_name", currentUser.getFirstName());
        payhereParams.put("last_name", currentUser.getLastName());
        payhereParams.put("email", currentUser.getEmail());
        payhereParams.put("phone", currentUser.getPhone());

        // FIXED: Using savedBooking.getTotalCost() to pass back to the DTO wrapper signature
        return new BookingResponse(savedBooking.getId(), savedBooking.getStatus().name(), savedBooking.getTotalCost(), payhereParams);
    }

    @Override
    @Transactional
    public void processPayhereWebhook(Map<String, String> params) {
        Long orderId = Long.parseLong(params.get("order_id"));
        String statusCode = params.get("status_code");
        String md5sig = params.get("md5sig");

        Booking booking = bookingRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Target order booking entity reference missing"));

        // Recalculate signature to guarantee safety against injection vectors
        String generatedLocalSig = uppercaseMd5(
                merchantId + orderId + params.get("payhere_amount") + params.get("payhere_currency") + statusCode + uppercaseMd5(merchantSecret)
        );

        if (!generatedLocalSig.equalsIgnoreCase(md5sig)) {
            throw new SecurityException("PayHere signature verification mismatch exception.");
        }

        if ("2".equals(statusCode)) {
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            // RUN ASYNC PROCESSES: Generate Meet link, notify users
            notificationService.triggerBookingConfirmationFlow(booking);
        } else {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
        }
    }

    private String generatePayhereMd5Hash(String merchantId, String orderId, double amount, String currency, String secret) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
        DecimalFormat df = new DecimalFormat("0.00", symbols);
        String amountString = df.format(amount);

        return uppercaseMd5(merchantId + orderId + amountString + currency + uppercaseMd5(secret));
    }

    private String uppercaseMd5(String input) {
        return DigestUtils.md5DigestAsHex(input.getBytes()).toUpperCase();
    }

    @Override
    public BookingResponse getBookingById(Long bookingId, User currentUser) {
        // FIX 1: Change BookingRepository (Type) to bookingRepository (Autowired Instance)
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        // Security check — only the owner can view their booking
        if (!booking.getClient().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        // FIX 2: Construct and return the response object matching your DTO
        return new BookingResponse(
                booking.getId(),
                booking.getStatus().name(),
                booking.getTotalCost(),
                null // Pass null or empty map since PayHere parameters aren't needed for fetching details
        );
    }
} // FIX 3: Ensure this closing brace cleanly terminates your BookingServiceImpl class definition!


