package com.example.demo.controllers;

import com.example.demo.dto.AuthDtos.CaptainProfileUpdateRequest;
import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.dto.AuthDtos.PhotoResponse;
import com.example.demo.services.CaptainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/captain")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CAPTAIN')")
public class CaptainController {

    private final CaptainService captainService;

    /**
     * PUT /api/captain/profile/{userId}
     * Updates captain's fullName, email, or password.
     * currentPassword is always required.
     */
    @PutMapping("/profile/{userId}")
    public ResponseEntity<MessageResponse> updateProfile(
            @PathVariable String userId,
            @RequestBody CaptainProfileUpdateRequest request) {
        captainService.updateProfile(userId, request);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully."));
    }

    /**
     * POST /api/captain/profile/{userId}/photo
     * Uploads / replaces the captain's avatar photo.
     * Does NOT require currentPassword.
     */
    @PostMapping(value = "/profile/{userId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoResponse> uploadPhoto(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            String dataUrl = captainService.uploadPhoto(userId, file);
            return ResponseEntity.ok(new PhotoResponse("Photo updated successfully.", dataUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PhotoResponse(e.getMessage(), null));
        }
    }

    /**
     * DELETE /api/captain/profile/{userId}/photo
     * Removes the captain's avatar photo.
     * Does NOT require currentPassword.
     */
    @DeleteMapping("/profile/{userId}/photo")
    public ResponseEntity<MessageResponse> deletePhoto(@PathVariable String userId) {
        captainService.deletePhoto(userId);
        return ResponseEntity.ok(new MessageResponse("Photo removed successfully."));
    }

    /**
     * GET /api/captain/profile/{userId}/photo
     * Returns the current photoUrl (data-url string or null).
     */
    @GetMapping("/profile/{userId}/photo")
    public ResponseEntity<Map<String, String>> getPhoto(@PathVariable String userId) {
        String url = captainService.getPhotoUrl(userId);
        return ResponseEntity.ok(Map.of("photoUrl", url != null ? url : ""));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
