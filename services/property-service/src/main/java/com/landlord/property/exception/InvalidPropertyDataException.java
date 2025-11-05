package com.landlord.property.exception;

public class InvalidPropertyDataException extends RuntimeException {
    public InvalidPropertyDataException(String message) {
        super(message);
    }

    public InvalidPropertyDataException(String message, Throwable cause) {
        super(message, cause);
    }
}