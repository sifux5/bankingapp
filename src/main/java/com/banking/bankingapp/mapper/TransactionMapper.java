package com.banking.bankingapp.mapper;

import com.banking.bankingapp.dto.TransactionResponse;
import com.banking.bankingapp.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getFromAccount() != null ? transaction.getFromAccount().getAccountNumber() : null,
                transaction.getToAccount() != null ? transaction.getToAccount().getAccountNumber() : null,
                transaction.getAmount(),
                transaction.getTransactionType(),
                transaction.getStatus(),
                transaction.getDescription(),
                transaction.getCategory(),
                transaction.getCreatedAt()
        );
    }
}