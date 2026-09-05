package com.ledgerly.api.service;
import com.ledgerly.api.entity.Transaction;
import com.ledgerly.api.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import java.util.*;
@Service
public class TransactionService {
 private final TransactionRepository repo;
 public TransactionService(TransactionRepository repo){this.repo=repo;}
 public List<Transaction> all(){return repo.findAll();}
 public Transaction create(Transaction t){return repo.save(t);}
 public Transaction update(UUID id, Transaction incoming){
   Transaction t=repo.findById(id).orElseThrow();
   t.setDate(incoming.getDate()); t.setMerchant(incoming.getMerchant()); t.setAmount(incoming.getAmount());
   t.setType(incoming.getType()); t.setCategory(incoming.getCategory()); t.setAccount(incoming.getAccount()); t.setTags(incoming.getTags());
   return repo.save(t);
 }
}