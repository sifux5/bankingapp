package com.banking.bankingapp.mapper;

import com.banking.bankingapp.dto.AccountResponse;
import com.banking.bankingapp.entity.Account;
import com.banking.bankingapp.entity.AccountType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class AccountMapperTest {

    private AccountMapper accountMapper;

    @BeforeEach
    void setUp() {
        accountMapper = new AccountMapper();
    }

    @Test
    void toResponse_ShouldMapAllFields() {
        Account account = new Account();
        account.setId(1L);
        account.setAccountNumber("1234567890");
        account.setAccountType(AccountType.CHECKING);
        account.setBalance(BigDecimal.valueOf(500));
        account.setActive(true);
        account.setCreatedAt(LocalDateTime.now());

        AccountResponse response = accountMapper.toResponse(account);

        assertEquals(1L, response.getId());
        assertEquals("1234567890", response.getAccountNumber());
        assertEquals(AccountType.CHECKING, response.getAccountType());
        assertEquals(BigDecimal.valueOf(500), response.getBalance());
        assertTrue(response.isActive());
    }

    @Test
    void toResponse_InactiveAccount_ShouldMapCorrectly() {
        Account account = new Account();
        account.setId(2L);
        account.setAccountNumber("0987654321");
        account.setAccountType(AccountType.SAVINGS);
        account.setBalance(BigDecimal.ZERO);
        account.setActive(false);

        AccountResponse response = accountMapper.toResponse(account);

        assertFalse(response.isActive());
        assertEquals(BigDecimal.ZERO, response.getBalance());
    }
}