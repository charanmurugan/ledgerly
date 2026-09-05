package com.ledgerly.api.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
@Entity @Table(name="transactions")
public class Transaction {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false) private LocalDate date;
 @Column(nullable=false) private String merchant;
 @Column(nullable=false, precision=19, scale=4) private BigDecimal amount;
 @Column(nullable=false) private String type;
 @Column(nullable=false) private String category;
 @Column(nullable=false) private String account;
 @Column(columnDefinition="text") private String tags;
 public UUID getId(){return id;} public LocalDate getDate(){return date;} public void setDate(LocalDate v){date=v;}
 public String getMerchant(){return merchant;} public void setMerchant(String v){merchant=v;}
 public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){amount=v;}
 public String getType(){return type;} public void setType(String v){type=v;}
 public String getCategory(){return category;} public void setCategory(String v){category=v;}
 public String getAccount(){return account;} public void setAccount(String v){account=v;}
 public String getTags(){return tags;} public void setTags(String v){tags=v;}
}