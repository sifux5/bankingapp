package com.banking.bankingapp.controller;

import com.banking.bankingapp.dto.AccountResponse;
import com.banking.bankingapp.entity.AccountType;
import com.banking.bankingapp.entity.User;
import com.banking.bankingapp.service.AccountService;
import com.banking.bankingapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createAccount(
            @RequestParam String email,
            @RequestParam AccountType accountType) {
        try {
            User user = userService.findByEmail(email);
            AccountResponse account = accountService.createAccount(user, accountType);
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserAccounts(@PathVariable String email) {
        try {
            User user = userService.findByEmail(email);
            List<AccountResponse> accounts = accountService.getUserAccounts(user);
            return ResponseEntity.ok(accounts);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/balance/{accountNumber}")
    public ResponseEntity<?> getBalance(@PathVariable String accountNumber) {
        try {
            AccountResponse account = accountService.getAccountBalance(accountNumber);
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/deactivate/{accountNumber}")
    public ResponseEntity<?> deactivateAccount(@PathVariable String accountNumber) {
        try {
            accountService.deactivateAccount(accountNumber);
            return ResponseEntity.ok(Map.of("message", "Account deactivated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
