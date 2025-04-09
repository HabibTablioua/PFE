package org.example.accountservice.entities;


public class AccountCreationException extends RuntimeException {
    public AccountCreationException(String message) {
        super(message);
    }
}

