package com.landlord.property.exception;

public class PropertyUnitNotFoundException extends RuntimeException {
    public PropertyUnitNotFoundException(String message) {
        super(message);
    }

    public PropertyUnitNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}