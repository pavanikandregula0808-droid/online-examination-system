package com.exam.system.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.exam.system.dto.AuthResponse;
import com.exam.system.dto.LoginRequest;
import com.exam.system.dto.RegisterRequest;
import com.exam.system.model.User;
import com.exam.system.repository.UserRepository;
import com.exam.system.security.JwtUtils;

import jakarta.mail.internet.MimeMessage;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public String registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        try {
            User user = new User(
                    request.getUsername(),
                    request.getEmail(),
                    passwordEncoder.encode(request.getPassword()),
                    request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT"
            );

            userRepository.save(user);
            System.out.println("SUCCESSFULLY REGISTERED USER: " + request.getEmail());
            return "User registered successfully!";
        } catch (Exception e) {
            System.out.println("REGISTRATION FAILED WITH ERROR:");
            e.printStackTrace();
            throw new RuntimeException("Error during registration: " + e.getMessage());
        }
    }

    public AuthResponse authenticateUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found with email: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Error: Invalid password!");
        }

        String token = jwtUtils.generateJwtToken(user.getEmail(), user.getRole());

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: No account found with this email address!"));

        // Generate a 6-digit numeric OTP code
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setResetToken(otp);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15)); // Valid for 15 mins
        userRepository.save(user);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Your UniExam Pro Password Reset OTP 🔒🔑");

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto;\">" +
                    "<h2 style=\"text-align: center; color: #111;\">🔒🔑 Password Reset OTP</h2>" +
                    "<p>Hello <b>" + user.getUsername() + "</b>,</p>" +
                    "<p>Your One-Time Password (OTP) for UniExam Pro is:</p>" +
                    "<div style=\"text-align: center; margin: 25px 0;\">" +
                    "  <div style=\"background: #2563eb; color: #ffffff; padding: 18px 30px; font-size: 28px; font-weight: bold; letter-spacing: 6px; display: inline-block; border-radius: 8px;\">" + otp + "</div>" +
                    "</div>" +
                    "<p style=\"color: #333; font-size: 14px;\">This OTP is valid for 15 minutes.</p>" +
                    "<p style=\"color: #dc2626; font-size: 14px; font-weight: 500;\">⚠️ Do not share this OTP with anyone.</p>" +
                    "<hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;\" />" +
                    "<p style=\"color: #64748b; font-size: 12px;\">If you did not request this, please ignore this email.</p>" +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            return "Password reset instructions have been successfully sent to your email address.";
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error: Failed to send real email. Please check server mail configurations.");
        }
    }

    public String resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Error: Invalid password reset token!"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Error: Password reset token has expired!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return "Password has been successfully reset!";
    }
}