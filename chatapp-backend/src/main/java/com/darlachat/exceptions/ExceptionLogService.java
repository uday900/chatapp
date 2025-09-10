package com.darlachat.exceptions;

import org.springframework.stereotype.Service;

/**
 * Service for logging and storing exceptions.
 * Can be implemented to log to a file, database, or monitoring system.
 */
public interface ExceptionLogService {

    /**
     * Save or log the given exception/throwable.
     * Default implementation does nothing, making it optional to override.
     *
     * @param exception or error to log
     */
    default void saveException(Exception ex) {
        // optional: no-op implementation
    }

    /**
     * Save or log the given exception/throwable with the request path.
     * Default implementation does nothing, making it optional to override.
     *
     * @param exception the exception or error to log
     * @param path the request path where exception occurred
     * @throws Throwable 
     */
    default void saveException(Exception ex, String path) throws Exception {
        // optional: no-op implementation
    }
}
