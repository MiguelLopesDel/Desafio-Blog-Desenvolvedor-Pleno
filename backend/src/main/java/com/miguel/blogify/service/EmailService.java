package com.miguel.blogify.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void send(String to, String subject, String content) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setText(content, true);
            helper.setTo(to);
            helper.setSubject(subject);
//            helper.setFrom("no-reply@blogify.com");
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new IllegalStateException("Falha ao enviar email", e);
        }
    }

    public String buildVerificationEmail(String name, String link) {
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                + "<h1 style='color: #333; text-align: center;'>Confirme seu email</h1>"
                + "<p>Olá " + name + ",</p>"
                + "<p>Obrigado por se registrar no Blogify. Para confirmar seu email, por favor clique no link abaixo:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + link + "' style='background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; "
                + "text-decoration: none; display: inline-block; border-radius: 5px;'>Confirmar Email</a>"
                + "</div>"
                + "<p>O link expira em 30 minutos.</p>"
                + "<p>Se você não solicitou este email, por favor ignore-o.</p>"
                + "<p>Atenciosamente,</p>"
                + "<p>Equipe Blogify</p>"
                + "</div>";
    }
}