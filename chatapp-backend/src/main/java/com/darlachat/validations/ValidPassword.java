package com.darlachat.validations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom annotation to validate passwords based on defined rules.
 * This will be applied to fields (e.g. password fields in DTOs).
 */
@Target(ElementType.FIELD) // Annotation can only be applied to fields
@Retention(RetentionPolicy.RUNTIME) // Annotation is available at runtime (for validation to work)
@Constraint(validatedBy = ValidPasswordValidator.class) // Binds this annotation to the validator logic
public @interface ValidPassword {

    /**
     * Default error message if validation fails and is not overridden.
     */
    String message() default "Password must be 8–16 characters";

    /**
     * Allows grouping of constraints. Useful if you want to apply validation
     * in different contexts (e.g., registration vs. update).
     */
    Class<?>[] groups() default {};

    /**
     * Payload can be used by clients of the Bean Validation API to assign
     * custom payload objects to a constraint. Rarely used in practice.
     */
    Class<? extends Payload>[] payload() default {};
}
