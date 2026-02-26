package com.banking.bankingapp.config;

import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_SECONDS = 30; // 5 minutit

    private final ConcurrentHashMap<String, Integer> attempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Instant> blockedUntil = new ConcurrentHashMap<>();

    public boolean isBlocked(String email) {
        Instant blocked = blockedUntil.get(email);
        if (blocked != null) {
            if (Instant.now().isBefore(blocked)) {
                return true;
            } else {
                blockedUntil.remove(email);
                attempts.remove(email);
            }
        }
        return false;
    }

    public void recordFailedAttempt(String email) {
        int count = attempts.merge(email, 1, Integer::sum);
        if (count >= MAX_ATTEMPTS) {
            blockedUntil.put(email, Instant.now().plusSeconds(BLOCK_DURATION_SECONDS));
        }
    }

    public void resetAttempts(String email) {
        attempts.remove(email);
        blockedUntil.remove(email);
    }

    public long getSecondsUntilUnblocked(String email) {
        Instant blocked = blockedUntil.get(email);
        if (blocked != null) {
            return Instant.now().until(blocked, java.time.temporal.ChronoUnit.SECONDS);
        }
        return 0;
    }
}