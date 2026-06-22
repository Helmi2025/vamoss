package com.example.demo.exceptions;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void testResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> res = handler.handleResourceNotFoundException(ex);
        Assertions.assertEquals(HttpStatus.NOT_FOUND, res.getStatusCode());
        Assertions.assertEquals("NOT_FOUND", res.getBody().error());
        Assertions.assertEquals("Not found", res.getBody().message());
    }

    @Test
    void testBusinessException() {
        BusinessException ex = new BusinessException("Bad request");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> res = handler.handleBusinessException(ex);
        Assertions.assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        Assertions.assertEquals("BAD_REQUEST", res.getBody().error());
        Assertions.assertEquals("Bad request", res.getBody().message());
    }

    @Test
    void testConflictException() {
        ConflictException ex = new ConflictException("Conflict");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> res = handler.handleConflictException(ex);
        Assertions.assertEquals(HttpStatus.CONFLICT, res.getStatusCode());
        Assertions.assertEquals("CONFLICT", res.getBody().error());
        Assertions.assertEquals("Conflict", res.getBody().message());
    }

    @Test
    void testGenericException() {
        Exception ex = new RuntimeException("Internal");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> res = handler.handleGenericException(ex);
        Assertions.assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
        Assertions.assertEquals("INTERNAL_SERVER_ERROR", res.getBody().error());
        Assertions.assertEquals("An unexpected error occurred", res.getBody().message());
    }
}
