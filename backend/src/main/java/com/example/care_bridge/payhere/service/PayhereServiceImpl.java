package com.example.care_bridge.payhere.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.text.DecimalFormat;
import java.util.Map;

@Service
public class PayhereServiceImpl implements PayhereService {

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Override
    public String generateMD5Signature(String orderId, double amount, String currency) {
        // PayHere requires exactly 2 decimal places (e.g., "150.00") or the hash will mismatch
        DecimalFormat df = new DecimalFormat("0.00");
        String formattedAmount = df.format(amount);

        String rawString = merchantId + orderId + formattedAmount + currency + getMd5Hex(merchantSecret);
        return getMd5Hex(rawString);
    }

    @Override
    public boolean isValidNotification(Map<String, String> params) {
        String orderId = params.get("order_id");
        String payhereAmount = params.get("payhere_amount");
        String payhereCurrency = params.get("payhere_currency");
        String statusCode = params.get("status_code");
        String incomingSignature = params.get("md5sig");

        if (incomingSignature == null) return false;

        // PayHere signature calculation formula for verification webhooks:
        // MerchantID + OrderID + PayHereAmount + PayHereCurrency + StatusCode + MD5(MerchantSecret)
        String rawText = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + getMd5Hex(merchantSecret);
        String calculatedSignature = getMd5Hex(rawText);

        return calculatedSignature.equalsIgnoreCase(incomingSignature);
    }

    private String getMd5Hex(String input) {
        return DigestUtils.md5DigestAsHex(input.getBytes()).toUpperCase();
    }
}