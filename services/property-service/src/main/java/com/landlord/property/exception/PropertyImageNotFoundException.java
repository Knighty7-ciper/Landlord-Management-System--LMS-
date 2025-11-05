package com.landlord.property.exception;

public class PropertyImageNotFoundException extends RuntimeException {
    public PropertyImageNotFoundException(String message) {
        super(message);
    }

    public PropertyImageNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}