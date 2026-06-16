package com.example.care_bridge.payhere.controller;

import com.example.care_bridge.booking.service.BookingService;
import com.example.care_bridge.payhere.service.PayhereService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PayhereWebhookController {

    @Autowired
    private PayhereService payhereService;

    @Autowired
    private BookingService bookingService;

    /**
     * PayHere securely contacts this endpoint using application/x-www-form-urlencoded formatting parameters.
     */
    @PostMapping(value = "/payhere-notify", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> receivePayhereNotification(@RequestParam Map<String, String> requestParams) {

        // 1. Double check security signature keys to confirm authenticity
        if (!payhereService.isValidNotification(requestParams)) {
            System.err.println("Warning: Received a forged or invalid PayHere signature notification block!");
            return ResponseEntity.badRequest().build(); // Block unauthorized requests immediately
        }

        // 2. Delegate data updating mechanics directly to your core Booking Manager
        bookingService.processPayhereWebhook(requestParams);

        // 3. Always reply with an HTTP 200 OK so PayHere knows you safely received the update
        return ResponseEntity.ok().build();
    }
}