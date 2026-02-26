package com.banking.bankingapp.service;

import com.banking.bankingapp.dto.AccountResponse;
import com.banking.bankingapp.entity.Account;
import com.banking.bankingapp.entity.AccountType;
import com.banking.bankingapp.entity.User;
import com.banking.bankingapp.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional
    public AccountResponse createAccount(User user, AccountType accountType) {
        Account account = new Account();
        account.setAccountNumber(generateAccountNumber());
        account.setAccountType(accountType);
        account.setBalance(BigDecimal.ZERO);
        account.setUser(user);
        account.setActive(true);

        Account savedAccount = accountRepository.save(account);
        return mapToResponse(savedAccount);
    }

    public List<AccountResponse> getUserAccounts(User user) {
        return accountRepository.findByUserAndActiveTrue(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Account findByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    public AccountResponse getAccountBalance(String accountNumber) {
        Account account = findByAccountNumber(accountNumber);
        return mapToResponse(account);
    }

    @Transactional
    public void deactivateAccount(String accountNumber) {
        Account account = findByAccountNumber(accountNumber);
        if (!account.isActive()) {
            throw new RuntimeException("Account is already inactive");
        }
        if (account.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot close account with remaining balance");
        }
        account.setActive(false);
        accountRepository.save(account);
    }

    private String generateAccountNumber() {
        Random random = new Random();
        String accountNumber;
        do {
            accountNumber = String.format("%010d", random.nextInt(1000000000));
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    private AccountResponse mapToResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getAccountType(),
                account.getBalance(),
                account.isActive(),
                account.getCreatedAt()
        );
    }
}