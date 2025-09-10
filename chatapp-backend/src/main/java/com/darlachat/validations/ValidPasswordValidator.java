package com.darlachat.validations;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidPasswordValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false; // null check
        }

        boolean valid = true;
        StringBuilder errorMessage = new StringBuilder();

        if (password.length() < 8 || password.length() > 16) {
            valid = false;
            errorMessage.append("Password must be between 8 and 16 characters. ");
        }

        if (!password.matches(".*[a-z].*")) {
            valid = false;
            errorMessage.append("Must include at least one lowercase letter. ");
        }

        if (!password.matches(".*[A-Z].*")) {
            valid = false;
            errorMessage.append("Must include at least one uppercase letter. ");
        }

        if (!password.matches(".*\\d.*")) {
            valid = false;
            errorMessage.append("Must include at least one number. ");
        }

        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>\\[\\]\\\\/~`_+=-].*")) {
            valid = false;
            errorMessage.append("Must include at least one special character. ");
        }

        if (!valid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(errorMessage.toString().trim())
                    .addConstraintViolation();
        }

        return valid;
    }
}
