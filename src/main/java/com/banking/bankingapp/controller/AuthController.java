package com.banking.bankingapp.controller;

import com.banking.bankingapp.config.LoginRateLimiter;
import com.banking.bankingapp.dto.LoginRequest;
import com.banking.bankingapp.dto.RegisterRequest;
import com.banking.bankingapp.entity.User;
import com.banking.bankingapp.service.UserService;
import com.banking.bankingapp.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginRateLimiter rateLimiter;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String email = request.getEmail();

        if (rateLimiter.isBlocked(email)) {
            long seconds = rateLimiter.getSecondsUntilUnblocked(email);
            long minutes = seconds / 60;
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Too many failed attempts. Try again in " + minutes + " minutes."));
        }

        try {
            User user = userService.findByEmail(email);

            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                rateLimiter.resetAttempts(email);

                String token = jwtUtil.generateToken(user.getEmail());

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());
                response.put("phoneNumber", user.getPhoneNumber());

                return ResponseEntity.ok(response);
            } else {
                rateLimiter.recordFailedAttempt(email);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
            }
        } catch (RuntimeException e) {
            rateLimiter.recordFailedAttempt(email);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
    }
}