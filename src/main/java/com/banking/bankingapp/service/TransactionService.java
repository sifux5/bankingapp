package com.banking.bankingapp.service;

import com.banking.bankingapp.dto.TransactionResponse;
import com.banking.bankingapp.dto.TransferRequest;
import com.banking.bankingapp.entity.Account;
import com.banking.bankingapp.entity.Transaction;
import com.banking.bankingapp.entity.TransactionStatus;
import com.banking.bankingapp.entity.TransactionType;
import com.banking.bankingapp.mapper.TransactionMapper;
import com.banking.bankingapp.repository.AccountRepository;
import com.banking.bankingapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final TransactionMapper transactionMapper;

    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        Account fromAccount = accountRepository.findByAccountNumber(request.getFromAccountNumber())
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new RuntimeException("Destination account not found"));

        if (!fromAccount.isActive()) throw new RuntimeException("Source account is not active");
        if (!toAccount.isActive()) throw new RuntimeException("Destination account is not active");
        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) throw new RuntimeException("Insufficient funds");

        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        Transaction transaction = new Transaction();
        transaction.setFromAccount(fromAccount);
        transaction.setToAccount(toAccount);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.TRANSFER);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(request.getDescription());

        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse deposit(String accountNumber, BigDecimal amount, String description) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.isActive()) throw new RuntimeException("Account is not active");

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setToAccount(account);
        transaction.setAmount(amount);
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(description);

        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse withdraw(String accountNumber, BigDecimal amount, String description) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.isActive()) throw new RuntimeException("Account is not active");
        if (account.getBalance().compareTo(amount) < 0) throw new RuntimeException("Insufficient funds");

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setFromAccount(account);
        transaction.setAmount(amount);
        transaction.setTransactionType(TransactionType.WITHDRAWAL);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(description);

        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    public List<TransactionResponse> getAccountTransactions(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return transactionRepository
                .findByFromAccountOrToAccountOrderByCreatedAtDesc(account, account)
                .stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse updateCategory(Long transactionId, String category) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        transaction.setCategory(category);
        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }
}