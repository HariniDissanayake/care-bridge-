package com.example.care_bridge.payhere.service;

import java.util.Map;

public interface PayhereService {

    /**
     * Generates an uppercase MD5 signature block for security verification checks.
     */
    String generateMD5Signature(String orderId, double amount, String currency);

    /**
     * Validates that an incoming notification actually came from PayHere and hasn't been modified.
     */
    boolean isValidNotification(Map<String, String> requestParams);
}