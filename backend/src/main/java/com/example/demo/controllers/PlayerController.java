package com.example.demo.controllers;

import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.dto.AuthDtos.PhotoResponse;
import com.example.demo.dto.AuthDtos.PlayerProfileUpdateRequest;
import com.example.demo.dto.FriendDto.FriendsPageDto;
import com.example.demo.dto.PlayerExploreDto;
import com.example.demo.dto.TeamManagementDtos.PlayerTeamViewDto;
import com.example.demo.services.FriendService;
import com.example.demo.services.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/player")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('PLAYER')")
public class PlayerController {

    private final PlayerService playerService;
    private final FriendService friendService;

    // ── Team ─────────────────────────────────────────────────────────────────

    @GetMapping("/team/{playerId}")
    public ResponseEntity<PlayerTeamViewDto> getTeamView(@PathVariable String playerId) {
        return ResponseEntity.ok(playerService.getTeamView(playerId));
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    @GetMapping("/profile/{playerId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable String playerId) {
        return ResponseEntity.ok(playerService.getProfileInfo(playerId));
    }

    @PutMapping("/profile/{playerId}")
    public ResponseEntity<MessageResponse> updateProfile(
            @PathVariable String playerId,
            @RequestBody PlayerProfileUpdateRequest request) {
        playerService.updateProfile(playerId, request);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully."));
    }

    @PostMapping(value = "/profile/{playerId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoResponse> uploadPhoto(
            @PathVariable String playerId,
            @RequestParam("file") MultipartFile file) {
        try {
            String dataUrl = playerService.uploadPhoto(playerId, file);
            return ResponseEntity.ok(new PhotoResponse("Photo updated successfully.", dataUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PhotoResponse(e.getMessage(), null));
        }
    }

    @DeleteMapping("/profile/{playerId}/photo")
    public ResponseEntity<MessageResponse> deletePhoto(@PathVariable String playerId) {
        playerService.deletePhoto(playerId);
        return ResponseEntity.ok(new MessageResponse("Photo removed successfully."));
    }

    @GetMapping("/profile/{playerId}/photo")
    public ResponseEntity<Map<String, String>> getPhoto(@PathVariable String playerId) {
        String url = playerService.getPhotoUrl(playerId);
        return ResponseEntity.ok(Map.of("photoUrl", url != null ? url : ""));
    }

    // ── Explore ───────────────────────────────────────────────────────────────

    /**
     * GET /api/player/explore?sportId=&viewerId=&username=
     * Returns active individual players in the same sport, decorated with
     * the current relationship status from the viewer's perspective.
     */
    @GetMapping("/explore")
    public ResponseEntity<List<PlayerExploreDto>> explorePlayers(
            @RequestParam String sportId,
            @RequestParam String viewerId,
            @RequestParam(required = false) String username) {
        return ResponseEntity.ok(playerService.explorePlayers(sportId, viewerId, username));
    }

    // ── Friends ───────────────────────────────────────────────────────────────

    /**
     * GET /api/player/friends/{playerId}
     * Returns the full friends page: friends, sent requests, received requests.
     */
    @GetMapping("/friends/{playerId}")
    public ResponseEntity<FriendsPageDto> getFriendsPage(@PathVariable String playerId) {
        return ResponseEntity.ok(friendService.getFriendsPage(playerId));
    }

    /**
     * POST /api/player/friends/request?senderId=&receiverId=
     * Sends a friend request.
     */
    @PostMapping("/friends/request")
    public ResponseEntity<Map<String, String>> sendFriendRequest(
            @RequestParam String senderId,
            @RequestParam String receiverId) {
        String requestId = friendService.sendRequest(senderId, receiverId);
        return ResponseEntity.ok(Map.of("requestId", requestId, "message", "Friend request sent."));
    }

    /**
     * DELETE /api/player/friends/request/{requestId}?requesterId=
     * Cancels a pending request (sender only).
     */
    @DeleteMapping("/friends/request/{requestId}")
    public ResponseEntity<MessageResponse> cancelFriendRequest(
            @PathVariable String requestId,
            @RequestParam String requesterId) {
        friendService.cancelRequest(requestId, requesterId);
        return ResponseEntity.ok(new MessageResponse("Friend request cancelled."));
    }

    /**
     * PUT /api/player/friends/request/{requestId}/accept?receiverId=
     * Accepts a pending request (receiver only).
     */
    @PutMapping("/friends/request/{requestId}/accept")
    public ResponseEntity<MessageResponse> acceptFriendRequest(
            @PathVariable String requestId,
            @RequestParam String receiverId) {
        friendService.acceptRequest(requestId, receiverId);
        return ResponseEntity.ok(new MessageResponse("Friend request accepted."));
    }

    /**
     * DELETE /api/player/friends/request/{requestId}/reject?receiverId=
     * Rejects a pending request (receiver only).
     */
    @DeleteMapping("/friends/request/{requestId}/reject")
    public ResponseEntity<MessageResponse> rejectFriendRequest(
            @PathVariable String requestId,
            @RequestParam String receiverId) {
        friendService.rejectRequest(requestId, receiverId);
        return ResponseEntity.ok(new MessageResponse("Friend request rejected."));
    }

    // ── Error handler ─────────────────────────────────────────────────────────

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
