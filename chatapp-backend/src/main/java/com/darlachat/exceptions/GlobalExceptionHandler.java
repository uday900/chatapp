package com.darlachat.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.context.request.WebRequest;

import static com.darlachat.common.ApiResponse.setError;
import static java.util.Objects.isNull;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static String getFullURL(HttpServletRequest request) {
        if (isNull(request))
            return null;
        StringBuilder url = new StringBuilder(request.getRequestURL().toString());
        String queryString = request.getQueryString();
        return queryString == null ? url.toString() : url.append('?').append(queryString).toString();
    }

    @ExceptionHandler(RecordNotFoundException.class)
    public ResponseEntity<?> handleNotFoundException(RecordNotFoundException ex, WebRequest request) {
        return new ResponseEntity<>(
                setError(
                        ex.getMessage(),
                        HttpStatus.NOT_FOUND,
                        getFullURL(((ServletRequestAttributes) request).getRequest())
                ),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception ex, WebRequest request) {
        return new ResponseEntity<>(
                setError(
                        ex.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        getFullURL(((ServletRequestAttributes) request).getRequest())
                ),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
