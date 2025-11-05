package com.landlord.property.exception;

public class UnauthorizedPropertyAccessException extends RuntimeException {
    public UnauthorizedPropertyAccessException(String message) {
        super(message);
    }

    public UnauthorizedPropertyAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}