package com.example.demo.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Slf4j
@Service
public class EmailService {

    @Autowired private JavaMailSender mailSender;
    @Autowired private TemplateEngine templateEngine;

    private static final String FROM = "VAMOS SPORT <vamossportsfax@gmail.com>";

    // ── 1. Application received (pending review) ────────────────────────────────

    public void sendApplicationReceived(String toEmail,
                                        String captainName,
                                        String teamName,
                                        String sportName,
                                        String appliedAt) {
        Context ctx = new Context();
        ctx.setVariable("captainName", captainName);
        ctx.setVariable("email", toEmail);
        ctx.setVariable("teamName", teamName);
        ctx.setVariable("sportName", sportName);
        ctx.setVariable("appliedAt", appliedAt);
        ctx.setVariable("logoUrl", "cid:logo");

        String html = templateEngine.process("email/application-received", ctx);
        send(toEmail, "Your VAMOS SPORT application is under review", html);
    }

    // ── 2. Application approved ─────────────────────────────────────────────────

    public void sendApplicationApproved(String toEmail,
                                        String captainName,
                                        String teamName,
                                        String sportName,
                                        String loginUrl) {
        Context ctx = new Context();
        ctx.setVariable("captainName", captainName);
        ctx.setVariable("email", toEmail);
        ctx.setVariable("teamName", teamName);
        ctx.setVariable("sportName", sportName);
        ctx.setVariable("loginUrl", loginUrl);
        ctx.setVariable("logoUrl", "cid:logo");

        String html = templateEngine.process("email/application-approved", ctx);
        send(toEmail, "Your VAMOS SPORT application has been approved!", html);
    }

    // ── 3. Application rejected ─────────────────────────────────────────────────

    public void sendApplicationRejected(String toEmail,
                                        String captainName,
                                        String teamName,
                                        String sportName,
                                        String reason) {
        Context ctx = new Context();
        ctx.setVariable("captainName", captainName);
        ctx.setVariable("email", toEmail);
        ctx.setVariable("teamName", teamName);
        ctx.setVariable("sportName", sportName);
        ctx.setVariable("reason", reason);
        ctx.setVariable("logoUrl", "cid:logo");

        String html = templateEngine.process("email/application-rejected", ctx);
        send(toEmail, "Update on your VAMOS SPORT application", html);
    }

    // ── 4. Player added to team ─────────────────────────────────────────────────

    public void sendPlayerAdded(String toEmail,
                                String playerName,
                                String teamName,
                                String captainName,
                                String sportName,
                                String plainPassword,
                                String loginUrl) {
        Context ctx = new Context();
        ctx.setVariable("playerName",   playerName);
        ctx.setVariable("email",        toEmail);
        ctx.setVariable("teamName",     teamName);
        ctx.setVariable("captainName",  captainName);
        ctx.setVariable("sportName",    sportName);
        ctx.setVariable("password",     plainPassword);
        ctx.setVariable("loginUrl",     loginUrl);
        ctx.setVariable("logoUrl",      "cid:logo");

        String html = templateEngine.process("email/player-added", ctx);
        send(toEmail, "You've been added to " + teamName + " on VAMOS SPORT!", html);
    }

    // ── 5. Player application received (pending review) ─────────────────────────

    public void sendPlayerApplicationReceived(String toEmail,
                                              String playerName,
                                              String sportName,
                                              String appliedAt) {
        Context ctx = new Context();
        ctx.setVariable("playerName", playerName);
        ctx.setVariable("email", toEmail);
        ctx.setVariable("sportName", sportName);
        ctx.setVariable("appliedAt", appliedAt);
        ctx.setVariable("logoUrl", "cid:logo");

        String html = templateEngine.process("email/player-application-received", ctx);
        send(toEmail, "Your VAMOS SPORT player application is under review", html);
    }

    // ── 6. Player application approved ──────────────────────────────────────────

    public void sendPlayerApplicationApproved(String toEmail,
                                              String playerName,
                                              String sportName,
                                              String loginUrl) {
        Context ctx = new Context();
        ctx.setVariable("playerName", playerName);
        ctx.setVariable("email", toEmail);
        ctx.setVariable("sportName", sportName);
        ctx.setVariable("loginUrl", loginUrl);
        ctx.setVariable("logoUrl", "cid:logo");

        String html = templateEngine.process("email/player-application-approved", ctx);
        send(toEmail, "Your VAMOS SPORT player application has been approved!", html);
    }

    // ── 7. Player application rejected ──────────────────────────────────────────

    public void sendPlayerApplicationRejected(String toEmail,
                                              String playerName,
                                              String sportName,
                                              String reason) {
        Context ctx = new Context();
        ctx.setVariable("playerName", playerName);
        ctx.setVariable("email", toEmail);
        ctx.setVariable("sportName", sportName);
        ctx.setVariable("reason", reason);
        ctx.setVariable("logoUrl", "cid:logo");

        String html = templateEngine.process("email/player-application-rejected", ctx);
        send(toEmail, "Update on your VAMOS SPORT player application", html);
    }

    // ── 8. Referee created ─────────────────────────────────────────────────────

    public void sendRefereeCreated(String toEmail,
                                   String refereeName,
                                   String plainPassword,
                                   String loginUrl) {
        Context ctx = new Context();
        ctx.setVariable("refereeName", refereeName);
        ctx.setVariable("email", toEmail);
        ctx.setVariable("password", plainPassword);
        ctx.setVariable("loginUrl", loginUrl);
        ctx.setVariable("logoUrl", "cid:logo");

        String html = templateEngine.process("email/referee-created", ctx);
        send(toEmail, "Welcome to VAMOS SPORT as a Referee!", html);
    }

    // ── Internal send with logo inline ─────────────────────────────────────────

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            // Attach logo as inline image so it shows in all email clients
            ClassPathResource logo = new ClassPathResource("static/images/logo.png");
            helper.addInline("logo", logo, "image/png");

            mailSender.send(message);
            log.info("Email sent to {} — Subject: {}", to, subject);

        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Email sending failed", e);
        }
    }
}
