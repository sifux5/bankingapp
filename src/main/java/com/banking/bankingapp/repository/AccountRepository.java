package com.banking.bankingapp.repository;

import com.banking.bankingapp.entity.Account;
import com.banking.bankingapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(String accountNumber);

    List<Account> findByUser(User user);

    List<Account> findByUserAndActiveTrue(User user);

    boolean existsByAccountNumber(String accountNumber);
}