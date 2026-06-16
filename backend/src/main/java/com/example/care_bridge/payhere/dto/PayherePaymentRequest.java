package com.example.care_bridge.payhere.dto;

public class PayherePaymentRequest {
    private String merchantId;
    private String orderId;
    private String items;
    private String currency;
    private double amount;
    private String hash;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    // --- GETTERS AND SETTERS ---
    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getItems() { return items; }
    public void setItems(String items) { this.items = items; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}