package com.example.care_bridge.service;

import com.example.care_bridge.payhere.service.PayhereServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class PayhereServiceImplTest {

    @InjectMocks
    private PayhereServiceImpl payhereService;

    private final String testMerchantId = "123456";
    private final String testMerchantSecret = "mySuperSecretMerchantKey123";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        Locale.setDefault(Locale.US);

        ReflectionTestUtils.setField(payhereService, "merchantId", testMerchantId);
        ReflectionTestUtils.setField(payhereService, "merchantSecret", testMerchantSecret);
    }

    @Test
    @DisplayName("Should generate a correct uppercase MD5 signature matching the pattern calculation")
    void shouldGenerateValidMD5Signature() {
        String orderId = "CB-ORD-1001";
        double amount = 1500.00;
        String currency = "LKR";

        String expectedSignature = "5150C2CC88B24118B5375DA3C722F690";

        String actualSignature = payhereService.generateMD5Signature(orderId, amount, currency);

        assertThat(actualSignature).isEqualTo(expectedSignature);
    }

    @Test
    @DisplayName("Should return true when verification parameters match the calculated hash signature")
    void shouldReturnTrueWhenNotificationIsValid() {
        Map<String, String> requestParams = new HashMap<>();
        requestParams.put("merchant_id", testMerchantId);
        requestParams.put("order_id", "CB-ORD-1001");
        requestParams.put("payhere_amount", "1500.00");
        requestParams.put("payhere_currency", "LKR");
        requestParams.put("status_code", "2");
        requestParams.put("md5sig", "11AF333024E7B0D5528CF51BBBB0EC13");

        boolean isValid = payhereService.isValidNotification(requestParams);

        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should return false when the signature from the notification parameter is tampered with")
    void shouldReturnFalseWhenNotificationSignatureIsTampered() {
        Map<String, String> requestParams = new HashMap<>();
        requestParams.put("merchant_id", testMerchantId);
        requestParams.put("order_id", "CB-ORD-1001");
        requestParams.put("payhere_amount", "1500.00");
        requestParams.put("payhere_currency", "LKR");
        requestParams.put("status_code", "2");
        requestParams.put("md5sig", "COMPLETELY_ALTERED_SIGNATURE_HASH");

        boolean isValid = payhereService.isValidNotification(requestParams);

        assertThat(isValid).isFalse();
    }
}