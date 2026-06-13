package com.example.care_bridge.notification.util;

import java.security.SecureRandom;

public class OtpGenerator {

    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generates a cryptographically secure 6-digit numeric OTP token.
     */
    public static String generate6DigitOtp() {
        int number = 100000 + secureRandom.nextInt(900000); // Guarantees a number between 100000 and 999999
        return String.valueOf(number);
    }
}