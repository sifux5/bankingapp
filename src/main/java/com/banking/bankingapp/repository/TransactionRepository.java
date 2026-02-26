package com.banking.bankingapp.repository;

import com.banking.bankingapp.entity.Account;
import com.banking.bankingapp.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFromAccountOrToAccountOrderByCreatedAtDesc(Account fromAccount, Account toAccount);

    List<Transaction> findByFromAccountOrderByCreatedAtDesc(Account fromAccount);

    List<Transaction> findByToAccountOrderByCreatedAtDesc(Account toAccount);
}