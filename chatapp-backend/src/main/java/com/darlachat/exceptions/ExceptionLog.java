package com.darlachat.exceptions;

/**
 * ExceptionLog class is used as a model/entity to represent
 * application-level exceptions that are captured and stored.
 *
 * Purpose:
 * - To keep track of unexpected application behavior
 * - To help developers and DevOps teams debug production issues
 * - To provide audit trails for errors
 *
 * Typical Fields in ExceptionLog:
 *  - id: Unique identifier (primary key if stored in DB)
 *  - timestamp: Date and time when the exception occurred
 *  - exceptionType: The class/type of exception (e.g., NullPointerException)
 *  - message: The exception message or custom error message
 *  - stackTrace: The full stack trace (optional, may be trimmed for size)
 *  - requestDetails: API request info (URL, method, headers, parameters, etc.)
 *  - userId: The user who triggered the error (if available)
 *  - role: User role
 *
 * Example Use Case:
 * - A REST controller throws a RuntimeException
 * - The @ControllerAdvice global exception handler captures it
 * - An ExceptionLog object is created with details
 * - The ExceptionLogService persists the details to DB/logs
 *
 * NOTE:
 * - Not all applications persist exceptions to the database (for performance reasons).
 * - Many use logging frameworks (Logback/SLF4J) and monitoring dashboards.
 * - Some hybrid approaches log critical exceptions to DB and all to files/monitoring tools.
 */

//@Data
//@Entity
//@Table(name = "exception_logs")
public class ExceptionLog {
    // Future implementation:
    // private Long id;
    // private LocalDateTime timestamp = LocalDateTime.now();
    // private String exceptionType;
    // private String message;
    // private String stackTrace;
	// private String path;
    // private String requestDetails;
    // private String userId;
	// private String role;
	
	/**
     * Constructor for basic exception log details
     *
     * @param exceptionType Type of exception (e.g., NullPointerException)
     * @param message       Exception message
     * @param path          The API endpoint or path where exception occurred
     * @param userId        User who triggered the exception
     * @param role          Role of the user
     */
//    public ExceptionLog(String exceptionType, String message, String path, String userId, String role) {
//        this.exceptionType = exceptionType;
//        this.message = message;
//        this.path = path;
//        this.userId = userId;
//        this.role = role;
//        this.timestamp = LocalDateTime.now();
//    }
}

