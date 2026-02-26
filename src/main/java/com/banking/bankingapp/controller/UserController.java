package com.banking.bankingapp.controller;

import com.banking.bankingapp.entity.User;
import com.banking.bankingapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile/{email}")
    public ResponseEntity<?> getProfile(@PathVariable String email) {
        try {
            User user = userService.findByEmail(email);
            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("phoneNumber", user.getPhoneNumber());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile/{email}")
    public ResponseEntity<?> updateProfile(@PathVariable String email, @RequestBody Map<String, String> request) {
        try {
            User user = userService.findByEmail(email);
            user.setFirstName(request.get("firstName"));
            user.setLastName(request.get("lastName"));
            if (request.get("phoneNumber") != null && !request.get("phoneNumber").isEmpty()) {
                user.setPhoneNumber(request.get("phoneNumber"));
            }
            userService.saveUser(user);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/change-password/{email}")
    public ResponseEntity<?> changePassword(@PathVariable String email, @RequestBody Map<String, String> request) {
        try {
            userService.changePassword(
                    email,
                    request.get("currentPassword"),
                    request.get("newPassword")
            );
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}