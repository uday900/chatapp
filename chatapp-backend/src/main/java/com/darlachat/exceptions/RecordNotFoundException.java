package com.darlachat.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception to be thrown when a requested resource is not found.
 * Automatically maps to HTTP 404 NOT FOUND status.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class RecordNotFoundException extends RuntimeException {

    /**
     * Constructs a new NotFoundException with the specified detail message.
     *
     * @param message the detail message, typically the reason for the exception
     */
    public RecordNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructs a new NotFoundException with the specified detail message and cause.
     *
     * @param message the detail message
     * @param cause   the root cause (can be retrieved later by getCause())
     */
    public RecordNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}