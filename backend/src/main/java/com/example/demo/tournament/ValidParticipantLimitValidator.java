package com.example.demo.tournament;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidParticipantLimitValidator implements ConstraintValidator<ValidParticipantLimit, Integer> {
    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }
        return value == 4 || value == 8;
    }
}
