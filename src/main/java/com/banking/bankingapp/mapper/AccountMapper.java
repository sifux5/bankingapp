package com.banking.bankingapp.mapper;

import com.banking.bankingapp.dto.AccountResponse;
import com.banking.bankingapp.entity.Account;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {

    public AccountResponse toResponse(Account account) {
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