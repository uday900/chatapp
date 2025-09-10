package com.darlachat.common;

import lombok.Data;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

/**
 * Standardized API Response structure for consistent response handling.
 * Includes request path for better debugging and traceability.
 */
@Data
public class ApiResponse<T> {

    private final T data;              // The response payload
    private final String message;      // A human-readable message
    private final boolean success;     // Derived from HTTP status code
    private final HttpStatus responseStatus; // HTTP status code
    private final LocalDateTime timestamp;   // Response creation time
    private final String path;         // Request path/URI

    /**
     * Main constructor.
     */
    public ApiResponse(T data, String message, HttpStatus responseStatus, String path) {
        this.data = data;
        this.message = message;
        this.success = responseStatus.is2xxSuccessful();
        this.responseStatus = responseStatus;
        this.timestamp = LocalDateTime.now();
        this.path = path;
    }

    /**
     * Creates a successful API response.
     */
    public static <T> ApiResponse<T> setSuccess(T data, String message, HttpStatus responseStatus, String path) {
        return new ApiResponse<>(data, message, responseStatus, path);
    }

    /**
     * Creates an error API response.
     */
    public static <T> ApiResponse<T> setError(String message, HttpStatus responseStatus, String path) {
        return new ApiResponse<>(null, message, responseStatus, path);
    }

}
