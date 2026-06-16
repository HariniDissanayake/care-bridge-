package com.example.care_bridge.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {

    @Value("${stripe.api.secret-key}")
    private String stripeSecretKey;

    @PostConstruct
    public void initStripe() {
        // Sets the secret API key globally for all Stripe SDK calls in the application context
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            throw new IllegalStateException("Stripe secret key is missing from application configuration properties.");
        }
        Stripe.apiKey = stripeSecretKey;
    }

}