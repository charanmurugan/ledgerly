package com.ledgerly.api.controller;
import com.ledgerly.api.entity.Transaction;
import com.ledgerly.api.service.TransactionService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/transactions")
public class TransactionController {
 private final TransactionService service;
 public TransactionController(TransactionService service){this.service=service;}
 @GetMapping public List<Transaction> all(){return service.all();}
 @PostMapping public Transaction create(@RequestBody Transaction t){return service.create(t);}
 @PutMapping("/{id}") public Transaction update(@PathVariable UUID id,@RequestBody Transaction t){return service.update(id,t);}
}