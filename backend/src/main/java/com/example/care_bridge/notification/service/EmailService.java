package com.example.care_bridge.notification.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // True tells Spring to render it as HTML webpage rather than plain text
            helper.setFrom("CareBridge Support <no-reply@carebridge.com>");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send system email out to: " + to + " Reason: " + e.getMessage());
        }
    }
}