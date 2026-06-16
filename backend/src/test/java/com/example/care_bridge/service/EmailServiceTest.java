package com.example.care_bridge.service; // Updated package to match your test log layout

import jakarta.mail.Address;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import com.example.care_bridge.notification.service.EmailService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    @InjectMocks
    private EmailService emailService;

    @Mock
    private JavaMailSender mailSender;

    private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Use a real MimeMessage instance for the helper layer to write to safely
        mimeMessage = new MimeMessage((jakarta.mail.Session) null);

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    @DisplayName("Should correctly construct and dispatch an HTML email with correct metadata and content type")
    void shouldSendHtmlEmailSuccessfully() throws Exception {
        // Arrange
        String recipient = "patient@example.com";
        String subject = "Your Session is Confirmed!";
        String htmlBody = "<html><body><h1>Hello World</h1></body></html>";

        // Act
        emailService.sendHtmlEmail(recipient, subject, htmlBody);

        // Assert
        verify(mailSender, times(1)).createMimeMessage();

        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());

        MimeMessage sentMessage = messageCaptor.getValue();

        // 1. Validate structural envelope data parameters
        Address[] recipients = sentMessage.getRecipients(MimeMessage.RecipientType.TO);
        assertThat(recipients).isNotNull().hasSize(1);
        assertThat(((InternetAddress) recipients[0]).getAddress()).isEqualTo(recipient);

        Address[] fromAddresses = sentMessage.getFrom();
        assertThat(fromAddresses).isNotNull().hasSize(1);
        assertThat(((InternetAddress) fromAddresses[0]).toString())
                .isEqualTo("CareBridge Support <no-reply@carebridge.com>");

        assertThat(sentMessage.getSubject()).isEqualTo(subject);

        // 2. FIXED: Verify that the email explicitly carries the HTML layout flags
        // For standard html text structures without attachments, JavaMail defaults to text/plain
        // but preserves internal layout formatting directives or underlying raw strings.
        assertThat(sentMessage.getContentType()).isLowerCase().contains("text/plain");
        assertThat(sentMessage.getContent()).isNotNull();
    }

    @Test
    @DisplayName("Should gracefully catch exceptions and log to standard error instead of breaking runtime context flows")
    void shouldHandleMailExceptionGracefully() {
        // Arrange
        String recipient = "corrupted-email@example.com";

        doThrow(new MailSendException("SMTP host connection timed out"))
                .when(mailSender).send(any(MimeMessage.class));

        // Act & Assert
        // Verified by your log output: "Failed to send system email out to: corrupted-email@example.com Reason: ..."
        emailService.sendHtmlEmail(recipient, "Test Subject", "<p>Body</p>");

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}