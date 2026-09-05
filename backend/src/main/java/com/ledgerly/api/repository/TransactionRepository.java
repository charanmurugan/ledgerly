package com.ledgerly.api.repository;
import com.ledgerly.api.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface TransactionRepository extends JpaRepository<Transaction,UUID>{}