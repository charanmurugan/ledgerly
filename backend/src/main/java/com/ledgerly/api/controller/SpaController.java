package com.ledgerly.api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    @GetMapping({
        "/", "/dashboard", "/transactions", "/recurring", "/subscriptions",
        "/budgets", "/goals", "/documents", "/rules", "/settings"
    })
    public String index() {
        return "forward:/index.html";
    }
}