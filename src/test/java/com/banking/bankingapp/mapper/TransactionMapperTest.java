package com.banking.bankingapp.mapper;

import com.banking.bankingapp.dto.TransactionResponse;
import com.banking.bankingapp.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TransactionMapperTest {

    private TransactionMapper transactionMapper;

    @BeforeEach
    void setUp() {
        transactionMapper = new TransactionMapper();
    }

    @Test
    void toResponse_ShouldMapAllFields() {
        Account fromAccount = new Account();
        fromAccount.setAccountNumber("1234567890");

        Account toAccount = new Account();
        toAccount.setAccountNumber("0987654321");

        Transaction transaction = new Transaction();
        transaction.setId(1L);
        transaction.setFromAccount(fromAccount);
        transaction.setToAccount(toAccount);
        transaction.setAmount(BigDecimal.valueOf(100));
        transaction.setTransactionType(TransactionType.TRANSFER);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription("Test transfer");
        transaction.setCategory("Food");
        transaction.setCreatedAt(LocalDateTime.now());

        TransactionResponse response = transactionMapper.toResponse(transaction);

        assertEquals(1L, response.getId());
        assertEquals("1234567890", response.getFromAccountNumber());
        assertEquals("0987654321", response.getToAccountNumber());
        assertEquals(BigDecimal.valueOf(100), response.getAmount());
        assertEquals(TransactionType.TRANSFER, response.getTransactionType());
        assertEquals("Food", response.getCategory());
    }

    @Test
    void toResponse_WhenNoFromAccount_ShouldReturnNull() {
        Transaction transaction = new Transaction();
        transaction.setId(1L);
        transaction.setFromAccount(null);
        transaction.setToAccount(null);
        transaction.setAmount(BigDecimal.valueOf(50));
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setStatus(TransactionStatus.COMPLETED);

        TransactionResponse response = transactionMapper.toResponse(transaction);

        assertNull(response.getFromAccountNumber());
        assertNull(response.getToAccountNumber());
    }
}
