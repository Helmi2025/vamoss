# Implementation Plan: Tournament Management Module

## Overview

Implement a single-elimination tournament management module on top of the existing Spring Boot 3 / MongoDB / Java 17 stack. The module introduces three new MongoDB collections (`tournaments`, `tournament_participants`, `matches`), three service layers, two controllers, a custom validator, a global exception handler, and a full test suite using JUnit 5 + jqwik for property-based tests.

New code lives in `com.example.demo` following existing sub-package conventions. Tournament-specific enums and entities go in a new `com.example.demo.tournament` sub-package for clean separation.

## Tasks

- [x] 1. Add jqwik dependency and create tournament sub-package structure
  - [x] 1.1 Add jqwik 1.8.x to `pom.xml` test scope
    - Add `net.jqwik:jqwik:1.8.5` with `<scope>test</scope>` to `pom.xml`
    - Confirm `spring-boot-starter-validation` is already present (it is)
    - _Requirements: Testing infrastructure for Properties 1–14_
  - [x] 1.2 Create the `com.example.demo.tournament` package placeholder
    - Create `src/main/java/com/example/demo/tournament/` directory by placing the first enum file there
    - Create `src/test/java/com/example/demo/tournament/` directory for test files
    - _Requirements: 11.1, 11.2, 11.3_


- [x] 2. Implement enums (Group 1 — Foundation)
  - [x] 2.1 Create `TournamentStatus`, `MatchStatus`, `MatchRound`, and `ParticipantType` enums
    - Create `com/example/demo/tournament/TournamentStatus.java` with values: `REGISTRATION_OPEN`, `READY`, `BRACKET_GENERATED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
    - Create `com/example/demo/tournament/MatchStatus.java` with values: `PENDING`, `READY`, `PLAYED`
    - Create `com/example/demo/tournament/MatchRound.java` with values: `QUARTER_FINAL`, `SEMI_FINAL`, `FINAL`
    - Create `com/example/demo/tournament/ParticipantType.java` with values: `TEAM`, `PLAYER`
    - _Requirements: 1.1, 6.4, 7.1, 8.3_


- [x] 3. Implement custom exceptions and GlobalExceptionHandler (Groups 1 & 6)
  - [x] 3.1 Create custom exception hierarchy
    - Create `com/example/demo/exceptions/` package
    - Create `ApiException.java`: abstract base extending `RuntimeException` with `HttpStatus status` field and `ApiException(String message, HttpStatus status)` constructor
    - Create `ResourceNotFoundException.java` extending `ApiException`, constructor sets `HttpStatus.NOT_FOUND`
    - Create `BusinessException.java` extending `ApiException`, constructor sets `HttpStatus.BAD_REQUEST`
    - Create `ConflictException.java` extending `ApiException`, constructor sets `HttpStatus.CONFLICT`
    - _Requirements: 1.3, 2.4, 3.2, 3.4, 5.2, 6.6, 6.7, 7.3, 7.4, 7.5, 9.3_
  - [x] 3.2 Create `GlobalExceptionHandler`
    - Create `com/example/demo/exceptions/GlobalExceptionHandler.java` annotated with `@RestControllerAdvice`
    - Add inner `ErrorResponse` record/class with fields: `String error`, `String message`, `LocalDateTime timestamp`
    - Handle `ResourceNotFoundException` → 404 with error body
    - Handle `BusinessException` → 400 with error body
    - Handle `ConflictException` → 409 with error body
    - Handle `MethodArgumentNotValidException` → 400, aggregate all field errors into message
    - Handle `Exception` (catch-all) → 500, log internally (never expose stack trace or cause), return `"An unexpected error occurred"`
    - _Requirements: 1.2, 1.4, 7.2, 7.3, 11.4_


- [x] 4. Implement MongoDB entities (Group 1 — Foundation)
  - [x] 4.1 Create `Tournament` entity
    - Create `com/example/demo/entities/Tournament.java`
    - Annotate with `@Document(collection = "tournaments")`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor` (Lombok)
    - Add `@CompoundIndex(def = "{'sportId': 1}")` and `@CompoundIndex(def = "{'status': 1}")` at class level
    - Fields: `@Id String id`, `String name`, `String sportId`, `int participantLimit`, `int currentParticipants` (default 0), `TournamentStatus status` (default `REGISTRATION_OPEN`), `String championId`, `ParticipantType championType`, `boolean registrationOpen` (default true), `LocalDate startDate`, `LocalDateTime createdAt`, `LocalDateTime updatedAt`
    - _Requirements: 1.1, 1.5, 11.1_
  - [x] 4.2 Create `TournamentParticipant` entity
    - Create `com/example/demo/entities/TournamentParticipant.java`
    - Annotate with `@Document(collection = "tournament_participants")`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`
    - Add `@CompoundIndex(def = "{'tournamentId': 1, 'participantId': 1}", unique = true)`
    - Fields: `@Id String id`, `String tournamentId`, `String participantId`, `ParticipantType participantType`
    - _Requirements: 3.1, 4.1, 11.2_
  - [x] 4.3 Create `TournamentMatch` entity
    - Create `com/example/demo/entities/TournamentMatch.java`
    - Annotate with `@Document(collection = "matches")`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`
    - Add `@CompoundIndex(def = "{'tournamentId': 1}")`
    - Fields: `@Id String id`, `String tournamentId`, `MatchRound round`, `int matchNumber`, `String participant1Id`, `ParticipantType participant1Type`, `String participant2Id`, `ParticipantType participant2Type`, `Integer score1`, `Integer score2`, `String winnerId`, `ParticipantType winnerType`, `MatchStatus status`, `String nextMatchId`, `Integer nextMatchPosition`, `LocalDateTime scheduledDate`, `LocalDateTime createdAt`
    - _Requirements: 6.2, 6.3, 7.1, 8.1, 11.3_


- [x] 5. Implement custom validator and request/response DTOs (Group 2)
  - [x] 5.1 Create `@ValidParticipantLimit` custom validator
    - Create `com/example/demo/tournament/ValidParticipantLimit.java`: `@interface` annotation with `@Constraint(validatedBy = ValidParticipantLimitValidator.class)`, default message `"Participant limit must be 4 or 8"`
    - Create `com/example/demo/tournament/ValidParticipantLimitValidator.java` implementing `ConstraintValidator<ValidParticipantLimit, Integer>`; `isValid` returns `value == 4 || value == 8`
    - _Requirements: 1.2_
  - [x] 5.2 Create request DTOs
    - Create `com/example/demo/dto/TournamentCreateRequest.java` with fields: `@NotBlank String name`, `@NotBlank String sportId`, `@ValidParticipantLimit int participantLimit`, `@NotNull LocalDate startDate`
    - Create `com/example/demo/dto/TournamentUpdateRequest.java` with fields: `@NotBlank String name`, `@NotNull LocalDate startDate`
    - Create `com/example/demo/dto/RegisterTeamRequest.java` with field: `@NotBlank String teamId`
    - Create `com/example/demo/dto/RegisterPlayerRequest.java` with field: `@NotBlank String playerId`
    - Create `com/example/demo/dto/MatchResultRequest.java` with fields: `@Min(0) @Max(999) int score1`, `@Min(0) @Max(999) int score2`
    - _Requirements: 1.2, 1.4, 3.1, 4.1, 7.1, 7.2_
  - [x] 5.3 Create response DTOs
    - Create `com/example/demo/dto/TournamentResponse.java`: flat record/class mirroring all `Tournament` fields
    - Create `com/example/demo/dto/TournamentParticipantResponse.java`: fields `id`, `tournamentId`, `participantId`, `participantType`
    - Create `com/example/demo/dto/MatchResponse.java`: flat record/class mirroring all `TournamentMatch` fields
    - Create `com/example/demo/dto/BracketResponse.java` with: `String tournamentId`, `ParticipantType participantType`, `ParticipantSummary champion`, `BracketMatchNode finalMatch`; inner static class `BracketMatchNode` with all match fields plus `BracketMatchNode semiFinal1`, `semiFinal2`; `BracketMatchNode` also carries `BracketMatchNode quarterFinal1`, `quarterFinal2` (null for 4-participant); inner static class `ParticipantSummary` with `String id`, `String name`
    - _Requirements: 2.1, 2.2, 6.5, 9.1, 9.2, 10.1_


- [x] 6. Implement repositories (Group 3)
  - [x] 6.1 Create `TournamentRepository`
    - Create `com/example/demo/repositories/TournamentRepository.java` extending `MongoRepository<Tournament, String>`
    - Declare: `List<Tournament> findBySportId(String sportId)`, `List<Tournament> findByStatus(TournamentStatus status)`
    - _Requirements: 11.1_
  - [x] 6.2 Create `TournamentParticipantRepository`
    - Create `com/example/demo/repositories/TournamentParticipantRepository.java` extending `MongoRepository<TournamentParticipant, String>`
    - Declare: `List<TournamentParticipant> findByTournamentId(String tournamentId)`, `boolean existsByTournamentIdAndParticipantId(String tournamentId, String participantId)`, `void deleteByTournamentIdAndParticipantId(String tournamentId, String participantId)`
    - _Requirements: 3.1, 4.1, 5.1, 11.2_
  - [x] 6.3 Create `TournamentMatchRepository`
    - Create `com/example/demo/repositories/TournamentMatchRepository.java` extending `MongoRepository<TournamentMatch, String>`
    - Declare: `List<TournamentMatch> findByTournamentId(String tournamentId)`, `List<TournamentMatch> findByTournamentIdAndRound(String tournamentId, MatchRound round)`
    - _Requirements: 6.2, 6.3, 9.1, 11.3_


- [x] 7. Checkpoint — compile and verify foundation
  - Ensure all enums, entities, exceptions, DTOs, and repositories compile with `./mvnw compile` without errors. Ask the user if questions arise.

- [x] 8. Implement `TournamentService` (Group 4)
  - [x] 8.1 Create `TournamentService` interface
    - Create `com/example/demo/services/TournamentService.java`
    - Declare all nine methods: `create`, `getAll`, `getById`, `update`, `cancel`, `registerTeam`, `registerPlayer`, `removeParticipant`, `getParticipants`
    - _Requirements: 1.1, 2.1, 2.3, 2.5, 3.1, 4.1, 5.1, 10.1_
  - [x] 8.2 Implement `TournamentServiceImpl` — create and retrieval
    - Create `com/example/demo/services/TournamentServiceImpl.java` annotated with `@Service`, `@RequiredArgsConstructor`
    - Inject `TournamentRepository`, `TournamentParticipantRepository`, `SportRepository`, `TeamRepository`, `PlayerRepository`, `BracketService` (via lazy/setter injection to avoid circular dependency)
    - Implement `create`: validate `sportId` exists (throw `ResourceNotFoundException` if not), set all initial fields (`status=REGISTRATION_OPEN`, `registrationOpen=true`, `currentParticipants=0`, `championId=null`, `championType=null`, set `createdAt`/`updatedAt`), derive `ParticipantType` from `sport.isTeamEnabled()`, save and return `TournamentResponse`
    - Implement `getAll`: return all tournaments mapped to `TournamentResponse`
    - Implement `getById`: find by id or throw `ResourceNotFoundException("Tournament not found")`
    - _Requirements: 1.1, 1.3, 1.5, 2.1, 2.2_
  - [x] 8.3 Implement `TournamentServiceImpl` — update and cancel
    - Implement `update`: find tournament (404 if not found), guard `status == COMPLETED` → throw `ConflictException("Completed tournaments cannot be modified")`, update `name` and `startDate`, set `updatedAt`, save and return response
    - Implement `cancel`: find tournament (404 if not found), guard `status == COMPLETED` → throw `ConflictException("Completed tournaments cannot be modified")`, set `status = CANCELLED` and `registrationOpen = false`, set `updatedAt`, save
    - _Requirements: 2.3, 2.4, 2.5, 2.6_
  - [x] 8.4 Implement `TournamentServiceImpl` — `registerTeam`
    - Apply validation guards in exact order: (1) tournament exists → 404; (2) `registrationOpen == true` → `BusinessException("Registration is closed for this tournament")`; (3) `sport.teamEnabled == true` else `BusinessException("This tournament only accepts individual players")`; (4) team's `sportId` matches tournament `sportId` else `BusinessException("Participant sport does not match tournament sport")`; (5) duplicate check via `existsByTournamentIdAndParticipantId` → `ConflictException("Participant is already registered")`
    - On success: save `TournamentParticipant(participantType=TEAM)`, increment `currentParticipants`, if `currentParticipants == participantLimit` set `registrationOpen=false`, `status=READY`, set `updatedAt`, save tournament
    - After setting `status=READY`, call `bracketService.generateBracket(tournamentId)` to auto-trigger bracket generation
    - Return `TournamentParticipantResponse`
    - _Requirements: 3.1–3.7, 6.1_
  - [x] 8.5 Implement `TournamentServiceImpl` — `registerPlayer`
    - Mirror `registerTeam` guard ordering with player-specific checks: (3) `sport.teamEnabled == false` else `BusinessException("This tournament only accepts teams")`; (4) player's `sportId` matches tournament `sportId`
    - On success: save `TournamentParticipant(participantType=PLAYER)`, increment `currentParticipants`, same capacity/status/auto-bracket logic as registerTeam
    - _Requirements: 4.1–4.7, 6.1_
  - [x] 8.6 Implement `TournamentServiceImpl` — `removeParticipant` and `getParticipants`
    - Implement `removeParticipant`: find tournament (404), guard `status in [BRACKET_GENERATED, IN_PROGRESS, COMPLETED]` → `ConflictException("Participants cannot be removed after the bracket has been generated")`; call `deleteByTournamentIdAndParticipantId`, decrement `currentParticipants`; if `registrationOpen == false && status == READY` then set `registrationOpen=true`, `status=REGISTRATION_OPEN`; set `updatedAt`, save tournament
    - Implement `getParticipants`: find tournament (404 if not found), return all `TournamentParticipant` docs for that tournament mapped to `TournamentParticipantResponse`
    - _Requirements: 5.1, 5.2, 5.3, 10.1, 10.2_


- [x] 9. Implement `BracketService` (Group 4)
  - [x] 9.1 Create `BracketService` interface
    - Create `com/example/demo/services/BracketService.java`
    - Declare: `void generateBracket(String tournamentId)`, `BracketResponse getBracket(String tournamentId)`, `void advanceWinner(TournamentMatch playedMatch, Tournament tournament)`
    - _Requirements: 6.1, 6.5, 8.1_
  - [x] 9.2 Implement `BracketServiceImpl` — `generateBracket` for 4-participant tournaments
    - Create `com/example/demo/services/BracketServiceImpl.java` annotated `@Service`, `@RequiredArgsConstructor`
    - Inject `TournamentRepository`, `TournamentParticipantRepository`, `TournamentMatchRepository`
    - In `generateBracket`: find tournament (404 if not found), load participants via `findByTournamentId`, ordered by natural insertion order (list index = registration order)
    - 4-participant branch: create SF1 (`P1 vs P2`, `round=SEMI_FINAL`, `status=READY`, `matchNumber=1`), SF2 (`P3 vs P4`, `round=SEMI_FINAL`, `status=READY`, `matchNumber=2`), Final (`round=FINAL`, `status=PENDING`, `matchNumber=3`, `participant1Id=null`, `participant2Id=null`); save Final first to obtain its id; set `SF1.nextMatchId=final.id`, `SF1.nextMatchPosition=1`; set `SF2.nextMatchId=final.id`, `SF2.nextMatchPosition=2`; save all three; set `tournament.status=BRACKET_GENERATED`, `tournament.updatedAt=now()`, save tournament
    - _Requirements: 6.2, 6.4, 6.1_
  - [x] 9.3 Implement `BracketServiceImpl` — `generateBracket` for 8-participant tournaments
    - 8-participant branch: create QF1 (`P1 vs P2`, READY, matchNumber=1), QF2 (`P3 vs P4`, READY, matchNumber=2), QF3 (`P5 vs P6`, READY, matchNumber=3), QF4 (`P7 vs P8`, READY, matchNumber=4); create SF1 (PENDING, matchNumber=5), SF2 (PENDING, matchNumber=6); create Final (PENDING, matchNumber=7)
    - Save SF1, SF2, Final first to obtain their ids; then set: `QF1.nextMatchId=SF1.id, position=1`; `QF2.nextMatchId=SF1.id, position=2`; `QF3.nextMatchId=SF2.id, position=1`; `QF4.nextMatchId=SF2.id, position=2`; `SF1.nextMatchId=Final.id, position=1`; `SF2.nextMatchId=Final.id, position=2`; `Final.nextMatchId=null`
    - Save all seven matches via `saveAll`; set `tournament.status=BRACKET_GENERATED`, `tournament.updatedAt=now()`, save tournament
    - _Requirements: 6.3, 6.4, 6.1_
  - [x] 9.4 Implement `BracketServiceImpl` — `advanceWinner` algorithm
    - Implement the full winner advancement algorithm:
      - Set `match.winnerId` and `match.winnerType` based on score comparison (`score1 > score2` → participant1, else participant2)
      - Set `match.status = PLAYED`
      - If `match.round != FINAL && match.nextMatchId != null`: load `nextMatch`; if `nextMatchPosition == 1` set `nextMatch.participant1Id/Type`, else set `nextMatch.participant2Id/Type`; if both participant slots are non-null set `nextMatch.status = READY`; save `nextMatch`
      - If `tournament.status == BRACKET_GENERATED` (first result): set `tournament.status = IN_PROGRESS`
      - If `match.round == FINAL`: set `tournament.championId = winner.id`, `tournament.championType = winner.type`, `tournament.status = COMPLETED`, `tournament.registrationOpen = false`
      - Set `tournament.updatedAt = now()`, save tournament; save match
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [x] 9.5 Implement `BracketServiceImpl` — `getBracket`
    - Implement `getBracket`: find tournament (404 if not found), load all matches via `findByTournamentId`, build `BracketResponse` tree bottom-up
    - Resolve `ParticipantSummary` for each participant slot: if `participantType == TEAM` load team name; if `PLAYER` load player full name; null slot → null summary
    - For 4-participant: `finalMatch.semiFinal1` and `finalMatch.semiFinal2` set; quarter-final fields left null
    - For 8-participant: each semi-final node carries `quarterFinal1` and `quarterFinal2` children
    - Set `champion` field from `tournament.championId` if `status == COMPLETED`
    - Return complete `BracketResponse`
    - _Requirements: 6.5_


- [x] 10. Implement `MatchService` (Group 4)
  - [x] 10.1 Create `MatchService` interface
    - Create `com/example/demo/services/MatchService.java`
    - Declare: `MatchResponse recordResult(String matchId, MatchResultRequest request)`, `MatchResponse getById(String matchId)`, `List<MatchResponse> getByTournamentId(String tournamentId)`
    - _Requirements: 7.1, 9.1, 9.2_
  - [x] 10.2 Implement `MatchServiceImpl`
    - Create `com/example/demo/services/MatchServiceImpl.java` annotated `@Service`, `@RequiredArgsConstructor`
    - Inject `TournamentMatchRepository`, `TournamentRepository`, `BracketService`
    - Implement `getById`: find match or throw `ResourceNotFoundException("Match not found")`
    - Implement `getByTournamentId`: delegate to `matchRepository.findByTournamentId`
    - Implement `recordResult`:
      - Find match (404 if not found)
      - Guard `match.status == PLAYED` → `ConflictException("Match result has already been recorded")`
      - Guard `match.status == PENDING` → `BusinessException("Match is not ready to receive results")`
      - Guard `request.score1 == request.score2` → `BusinessException("Draws are not permitted in single-elimination tournaments")`
      - Set `match.score1` and `match.score2`
      - Load tournament (`findById` or 404)
      - Call `bracketService.advanceWinner(match, tournament)` — this method finalises winner, saves match and tournament
      - Return `MatchResponse` from the updated match
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 9.2, 9.3_

- [x] 11. Checkpoint — service layer
  - Ensure all service implementations compile and unit tests from Group 7 pass for service-layer logic. Ask the user if any design ambiguity arises.


- [x] 12. Implement controllers (Group 5)
  - [x] 12.1 Implement `TournamentController`
    - Create `com/example/demo/controllers/TournamentController.java`
    - Annotate with `@RestController`, `@RequestMapping("/api/tournaments")`, `@RequiredArgsConstructor`
    - Inject `TournamentService`, `BracketService`, `MatchService`
    - Implement all 12 endpoints with correct `@PreAuthorize` annotations:
      - `POST /` — `@PreAuthorize("hasRole('ADMIN')")` → `tournamentService.create` → 200
      - `GET /` — `@PreAuthorize("isAuthenticated()")` → `tournamentService.getAll` → 200
      - `GET /{id}` — `@PreAuthorize("isAuthenticated()")` → `tournamentService.getById` → 200
      - `PUT /{id}` — `@PreAuthorize("hasRole('ADMIN')")` → `tournamentService.update` → 200
      - `DELETE /{id}` — `@PreAuthorize("hasRole('ADMIN')")` → `tournamentService.cancel` → 204
      - `POST /{id}/register-team` — `@PreAuthorize("hasRole('CAPTAIN')")` → `tournamentService.registerTeam` → 201
      - `POST /{id}/register-player` — `@PreAuthorize("hasRole('PLAYER')")` → `tournamentService.registerPlayer` → 201
      - `DELETE /{id}/participants/{participantId}` — `@PreAuthorize("hasRole('ADMIN')")` → `tournamentService.removeParticipant` → 204
      - `GET /{id}/participants` — `@PreAuthorize("isAuthenticated()")` → `tournamentService.getParticipants` → 200
      - `POST /{id}/generate-bracket` — `@PreAuthorize("hasRole('ADMIN')")` → guard `status != READY` → `BusinessException("Tournament is not full yet")` if not full; guard `status == BRACKET_GENERATED` → `ConflictException("Bracket has already been generated")`; else call `bracketService.generateBracket` → 200
      - `GET /{id}/bracket` — `@PreAuthorize("isAuthenticated()")` → `bracketService.getBracket` → 200
      - `GET /{id}/matches` — `@PreAuthorize("isAuthenticated()")` → `matchService.getByTournamentId` → 200
    - Add `@Valid` to all request body parameters
    - _Requirements: 1.6, 2.1, 2.2, 2.3, 2.5, 3.1, 4.1, 5.1, 6.5, 6.6, 6.7, 9.1, 10.1, 10.2, 12.1–12.6_
  - [x] 12.2 Implement `MatchController`
    - Create `com/example/demo/controllers/MatchController.java`
    - Annotate with `@RestController`, `@RequestMapping("/api/matches")`, `@RequiredArgsConstructor`
    - Inject `MatchService`
    - `GET /{id}` — `@PreAuthorize("isAuthenticated()")` → `matchService.getById` → 200
    - `PUT /{id}/result` — `@PreAuthorize("hasRole('ADMIN')")` → `matchService.recordResult(@Valid body)` → 200
    - _Requirements: 7.1, 7.6, 9.2, 9.3, 12.3_


- [x] 13. Checkpoint — full stack integration
  - Ensure `./mvnw compile` succeeds with zero errors. Manually verify that `GET /api/tournaments` returns 401 for an unauthenticated request (requires running server). Ask the user if questions arise.

- [x] 14. Write property-based tests (Group 7 — jqwik)
  - [x] 14.1 Write property tests for Tournament creation invariants (P1, P2, P3)
    - Create `src/test/java/com/example/demo/tournament/TournamentCreationPropertyTest.java`
    - Tag each test: `// Feature: tournament-management, Property N: <text>`
    - **Property 1: Tournament initial state invariant** — use `Arbitraries.strings().ofMinLength(1)` for name, `Arbitraries.of(4, 8)` for limit; mock repositories; assert `status=REGISTRATION_OPEN`, `registrationOpen=true`, `currentParticipants=0`, `championId=null`, `createdAt`/`updatedAt` non-null — `@Property(tries = 100)`
    - **Property 2: participantLimit rejects non-4/8** — use `Arbitraries.integers().filter(n -> n != 4 && n != 8)` for limit; invoke validator directly; assert constraint violation is returned — `@Property(tries = 100)`
    - **Property 3: Blank name / null date rejected** — use `Arbitraries.strings().withChars(' ', '\t', '\n').ofMinLength(1)` for name; assert Bean Validation rejects — `@Property(tries = 100)`
    - _Validates: Requirements 1.1, 1.2, 1.4, 1.5_
  - [x] 14.2 Write property tests for registration logic (P4, P5, P6)
    - Create `src/test/java/com/example/demo/tournament/RegistrationPropertyTest.java`
    - **Property 4: Registration increments and deduplicates** — generate random valid participant ids, mock repositories, call `registerTeam`/`registerPlayer` twice with same participant; assert first call increments count by 1, second throws `ConflictException` — `@Property(tries = 100)`
    - **Property 5: Sport mismatch rejected** — generate two different sport ids via `Arbitraries.strings().ofMinLength(1).filter(s -> !s.equals(tournamentSportId))`; assert `BusinessException` with message `"Participant sport does not match tournament sport"` — `@Property(tries = 100)`
    - **Property 6: Full → closed; removal → reopened** — `Arbitraries.of(4, 8)` for limit; register N participants, assert `registrationOpen=false` and `status=READY`; remove one participant, assert `registrationOpen=true` and `status=REGISTRATION_OPEN` — `@Property(tries = 100)`
    - _Validates: Requirements 3.3, 3.4, 3.6, 3.7, 4.3, 4.4, 4.6, 4.7, 5.3_
  - [x] 14.3 Write property tests for bracket structure (P7, P8, P14)
    - Create `src/test/java/com/example/demo/tournament/BracketPropertyTest.java`
    - **Property 7: 4-participant bracket structure** — generate 4 random participant ids; call `generateBracket`; assert exactly 3 matches, 2 with `status=READY` and `round=SEMI_FINAL`, both referencing the same `finalMatch.id` via `nextMatchId`; Final has `status=PENDING` and `nextMatchId=null` — `@Property(tries = 100)`
    - **Property 8: 8-participant bracket structure** — generate 8 random participant ids; call `generateBracket`; assert exactly 7 matches: 4 QF with `status=READY`, 2 SF with `status=PENDING` linked to Final, 1 Final with `status=PENDING`; verify all `nextMatchId` chains are correct — `@Property(tries = 100)`
    - **Property 14: BracketResponse completeness** — `Arbitraries.of(4, 8)` for size; call `getBracket`; assert `finalMatch != null`; for 4-participant: `semiFinal1/2 != null`, QF children null; for 8-participant: all QF nodes non-null — `@Property(tries = 100)`
    - _Validates: Requirements 6.2, 6.3, 6.4, 6.5_
  - [x] 14.4 Write property tests for winner advancement (P11)
    - (in `BracketPropertyTest.java`)
    - **Property 11: Winner slot advancement** — generate two non-Final matches sharing a `nextMatchId`, generate score pairs with `score1 != score2`, call `advanceWinner`; assert winner placed in correct slot (`nextMatchPosition=1` → `participant1Id`; `position=2` → `participant2Id`); when both slots filled assert next match `status=READY` — `@Property(tries = 100)`
    - _Validates: Requirements 8.1, 8.2_
  - [x] 14.5 Write property tests for match result recording (P9, P10)
    - Create `src/test/java/com/example/demo/tournament/MatchResultPropertyTest.java`
    - **Property 9: Winner determination is correct** — `Arbitraries.integers(0, 999)` for scores filtered `score1 != score2`; assert `winnerId` matches higher-score participant, `winnerType` is correct, `match.status=PLAYED` — `@Property(tries = 100)`
    - **Property 10: Negative scores rejected** — `Arbitraries.integers(Integer.MIN_VALUE, -1)` for one score; invoke `MatchResultRequest` Bean Validation; assert constraint violation — `@Property(tries = 100)`
    - _Validates: Requirements 7.1, 7.2, 7.3_
  - [x] 14.6 Write property tests for tournament lifecycle (P12, P13)
    - Create `src/test/java/com/example/demo/tournament/TournamentLifecyclePropertyTest.java`
    - **Property 12: Lifecycle transitions** — simulate full 4-participant bracket completion using mocks; assert first match result sets `status=IN_PROGRESS`; assert Final match result sets `status=COMPLETED`, `championId`/`championType` correct, `registrationOpen=false` — `@Property(tries = 100)`
    - **Property 13: updatedAt always advances** — generate random sequences of: create → register → remove → cancel mutations; after each operation capture `updatedAt`; assert each captured `updatedAt >= previous updatedAt` — `@Property(tries = 100)`
    - _Validates: Requirements 2.3, 8.3, 8.4, 8.5, 11.5_


- [x] 15. Write unit tests (Group 7 — JUnit 5 + Mockito)
  - [x]* 15.1 Write `TournamentServiceImplTest`
    - Create `src/test/java/com/example/demo/services/TournamentServiceImplTest.java`
    - Mock all repositories and `BracketService` with `@ExtendWith(MockitoExtension.class)`
    - Test cases: sport not found → 404; registration closed → 400 with correct message; sport type mismatch (team vs player) → 400; sport id mismatch → 400; duplicate registration → 409; status transitions to READY when full; status reopens when participant removed from READY tournament; update COMPLETED tournament → 409; cancel COMPLETED tournament → 409
    - _Requirements: 1.3, 2.4, 2.6, 3.2–3.5, 4.2–4.5, 5.2, 5.3_
  - [x]* 15.2 Write `BracketServiceImplTest`
    - Create `src/test/java/com/example/demo/services/BracketServiceImplTest.java`
    - Test cases: 4-participant bracket produces exactly 3 matches with correct `nextMatchId` linkage; 8-participant produces exactly 7 matches with all chain links correct; `advanceWinner` sets participant1 slot for `nextMatchPosition=1`; sets participant2 slot for `nextMatchPosition=2`; sets next match `READY` when both slots filled; sets `COMPLETED` and champion when Final played
    - _Requirements: 6.2, 6.3, 8.1, 8.2, 8.3_
  - [x]* 15.3 Write `MatchServiceImplTest`
    - Create `src/test/java/com/example/demo/services/MatchServiceImplTest.java`
    - Test cases: draw (equal scores) → `BusinessException`; PENDING match → `BusinessException`; PLAYED match → `ConflictException` (idempotence); valid result → `advanceWinner` called; match not found → 404
    - _Requirements: 7.1, 7.3, 7.4, 7.5_
  - [x]* 15.4 Write `GlobalExceptionHandlerTest`
    - Create `src/test/java/com/example/demo/exceptions/GlobalExceptionHandlerTest.java`
    - Use `@WebMvcTest` or direct handler instantiation
    - Assert: `ResourceNotFoundException` → 404 with `{ "error": "NOT_FOUND", ... }`; `BusinessException` → 400; `ConflictException` → 409; `MethodArgumentNotValidException` → 400 with field errors in message; generic `Exception` → 500 with `"An unexpected error occurred"` (no stack trace, no cause message in response body)
    - _Requirements: 11.4_

- [x] 16. Final checkpoint — all tests pass
  - Run `./mvnw test` and ensure all tests pass. Fix any compilation or test failures. Ask the user if questions arise.


- [x] 17. Frontend — Tournament Management UI
  - [x] 17.1 Admin — Tournament list and creation page
    - Create `frontend/src/pages/dashboards/admin/ManageTournaments.jsx`
    - Display all tournaments in a list/table (GET /api/tournaments)
    - Allow Admin to create a new tournament via a form (POST /api/tournaments): name, sportId (dropdown from /api/sports), participantLimit (4 or 8), startDate
    - Allow Admin to cancel a tournament (DELETE /api/tournaments/{id})
    - Allow Admin to update tournament name and startDate (PUT /api/tournaments/{id})
    - Create `frontend/src/pages/dashboards/admin/ManageTournaments.css` alongside the JSX
    - _Requirements: 1.1, 2.1, 2.3, 2.5_
  - [x] 17.2 Admin — Tournament detail, participant management, and bracket generation
    - Create `frontend/src/pages/dashboards/admin/TournamentDetail.jsx`
    - Show tournament details and participant list (GET /api/tournaments/{id}/participants)
    - Allow Admin to remove a participant (DELETE /api/tournaments/{id}/participants/{participantId})
    - Show "Generate Bracket" button when status is READY; call POST /api/tournaments/{id}/generate-bracket
    - Create `frontend/src/pages/dashboards/admin/TournamentDetail.css` alongside the JSX
    - _Requirements: 5.1, 6.6, 6.7_
  - [x] 17.3 Admin — Match result entry
    - Within `TournamentDetail.jsx` or a sub-component, show match list (GET /api/tournaments/{id}/matches)
    - For READY matches, allow Admin to enter score1 and score2 (PUT /api/matches/{id}/result)
    - _Requirements: 7.1, 9.1_
  - [x] 17.4 Admin — Bracket viewer
    - Create `frontend/src/pages/dashboards/admin/TournamentBracket.jsx` (or embed in TournamentDetail)
    - Render the hierarchical BracketResponse from GET /api/tournaments/{id}/bracket
    - Display match nodes with participant names, scores, and winner for each round (QUARTER_FINAL → SEMI_FINAL → FINAL → Champion)
    - Support both 4-participant and 8-participant layouts
    - Create `frontend/src/pages/dashboards/admin/TournamentBracket.css` alongside the JSX
    - _Requirements: 6.5_
  - [x] 17.5 Add "Tournaments" navigation to Admin sidebar and dashboard
    - Update `frontend/src/pages/dashboards/admin/AdminSidebar.jsx` to include a "Tournaments" link
    - Update `frontend/src/pages/dashboards/AdminDashboard.jsx` to route to ManageTournaments and TournamentDetail
    - _Requirements: 2.1_
  - [x] 17.6 Captain — Tournament page with registration and bracket modal
    - Create `frontend/src/pages/dashboards/captain/CaptainTournaments.jsx`
    - Fetch all tournaments and filter by the captain's team sport (GET /api/tournaments + match sportId)
    - For each tournament, display name, status, start date, and current/limit participant count
    - Show registration status: if the captain's teamId appears in GET /api/tournaments/{id}/participants, display "Registered" badge and suppress the register button
    - WHEN tournament status is REGISTRATION_OPEN or READY and registrationOpen = true and team is not yet registered, show "Register My Team" button that calls POST /api/tournaments/{id}/register-team
    - WHEN tournament status is BRACKET_GENERATED, IN_PROGRESS, or COMPLETED, render the tournament row/card as clickable and open a bracket modal (GET /api/tournaments/{id}/bracket) on click
    - Reuse or embed the bracket viewer component from task 17.4 inside the modal
    - Create `frontend/src/pages/dashboards/captain/CaptainTournaments.css` alongside the JSX
    - _Requirements: 3.1, 3.5, 14.1, 14.2, 14.3, 14.4, 14.5_
  - [x] 17.7 Add "Tournaments" navigation to Captain sidebar
    - Update `frontend/src/pages/dashboards/captain/CaptainSidebar.jsx` to include "Tournaments" link
    - Update `frontend/src/pages/dashboards/CaptainDashboard.jsx` to route to CaptainTournaments
    - _Requirements: 3.1, 14.1_
  - [x] 17.8 Player — Tournament view page (read-only with team status and bracket modal)
    - Create `frontend/src/pages/dashboards/player/PlayerTournaments.jsx`
    - Fetch all tournaments (GET /api/tournaments) and filter by the player's sport
    - Display all tournaments regardless of status; NO register button or registration action is present anywhere on this page
    - For each tournament, determine team participation status:
      - If player has a teamId (team-sport player): call GET /api/tournaments/{id}/participants, check if player's teamId is in the participants list; display "Your team is in this tournament" or "Your team is not registered" accordingly
      - If player has no teamId (individual-sport player): check if player's own playerId appears in the participants list; display "You are registered" or "Not registered"
    - WHEN tournament status is BRACKET_GENERATED, IN_PROGRESS, or COMPLETED, render the row/card as clickable and open a bracket modal (GET /api/tournaments/{id}/bracket) on click
    - WHEN tournament status is REGISTRATION_OPEN, READY, or CANCELLED, the row/card is non-clickable (no bracket modal)
    - Reuse or embed the bracket viewer component from task 17.4 inside the modal
    - Create `frontend/src/pages/dashboards/player/PlayerTournaments.css` alongside the JSX
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  - [x] 17.9 Add "Tournaments" navigation to Player sidebar
    - Update `frontend/src/pages/dashboards/player/PlayerSidebar.jsx` to include "Tournaments" link
    - Update `frontend/src/pages/dashboards/PlayerDashboard.jsx` to route to PlayerTournaments
    - _Requirements: 13.1_
  - [x] 17.10 Shared — Public bracket/tournament viewer
    - Create `frontend/src/pages/dashboards/TournamentBracketView.jsx` (accessible to all authenticated roles)
    - Any authenticated user can view the bracket for any tournament
    - Create `frontend/src/pages/dashboards/TournamentBracketView.css` alongside the JSX
    - _Requirements: 6.5, 9.1, 12.4_



## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; core behaviour is fully covered by property-based tests.
- Java version is 17 (per `pom.xml`), not 21 — avoid Java 21-only features such as virtual threads or pattern matching in switch statements.
- No `GlobalExceptionHandler` exists in the project yet — Task 3.2 creates it from scratch. No existing exceptions package — Task 3.1 creates it.
- `BracketService` is injected into `TournamentServiceImpl` to auto-trigger bracket generation after the tournament fills. Use `@Lazy` on that injection to break the circular dependency if Spring detects one.
- The `generateBracket` endpoint guard logic lives in `TournamentController` (not the service), because the service's auto-trigger path bypasses those guards by design.
- All match, participant, and tournament documents are preserved on cancellation (soft delete only).
- `updatedAt` must be set on every state-changing write in `TournamentServiceImpl` and `BracketServiceImpl` (including `advanceWinner`).
- jqwik property tests must include the tag comment `// Feature: tournament-management, Property N: <text>` and use `@Property(tries = 100)`.
- Task 18 introduces `ScheduleService` / `ScheduleServiceImpl` and a `MatchScheduleRequest` DTO — keep these separate from `MatchService` to maintain single-responsibility.
- Task 19 modifies `MatchServiceImpl.recordResult()` to allow score editing when `match.status == PLAYED`; the existing `ConflictException` guard must be removed and replaced with the edit-score path.
- `FieldRepository` likely already exists (ManageFields frontend exists); confirm before creating a new one in Task 18.
- Recursive cascade in Task 19 must terminate when a downstream match has `status != PLAYED` or when the chain reaches the Final with no further `nextMatchId`.


- [ ] 18. Match Scheduling (Requirement 15)
  - [ ] 18.1 Create `MatchScheduleRequest` DTO
    - Create `com/example/demo/dto/MatchScheduleRequest.java`
    - Fields: `@NotNull LocalDateTime scheduledDateTime`, `@NotBlank String fieldId`
    - _Requirements: 15.7_
  - [ ] 18.2 Verify or create `FieldRepository`
    - Check if `com/example/demo/repositories/FieldRepository.java` already exists
    - If not, create it extending `MongoRepository<Field, String>`
    - Ensure the `Field` entity has: `String id`, `String name`, `String sportId`, `boolean isAvailable`
    - _Requirements: 15.3, 15.4, 15.8_
  - [ ] 18.3 Create `ScheduleService` interface
    - Create `com/example/demo/services/ScheduleService.java`
    - Declare: `MatchResponse scheduleMatch(String matchId, MatchScheduleRequest request)`
    - _Requirements: 15.1_
  - [ ] 18.4 Implement `ScheduleServiceImpl`
    - Create `com/example/demo/services/ScheduleServiceImpl.java` annotated `@Service`, `@RequiredArgsConstructor`
    - Inject `TournamentMatchRepository`, `TournamentRepository`, `FieldRepository`
    - Implement `scheduleMatch`:
      - Find match by id (throw `ResourceNotFoundException("Match not found")` if absent)
      - Load tournament by `match.tournamentId` (throw `ResourceNotFoundException("Tournament not found")` if absent)
      - Guard: tournament status not in `[BRACKET_GENERATED, IN_PROGRESS, COMPLETED]` → `ConflictException("Match scheduling is not available until the bracket has been generated")`
      - Load field by `request.fieldId` (throw `ResourceNotFoundException("Field not found")` if absent)
      - Guard: `field.sportId != tournament.sportId` → `BusinessException("Field sport does not match tournament sport")`
      - Guard: `request.scheduledDateTime` before `tournament.startDate` at 00:00:00 or after `tournament.endDate` at 23:59:59 → `BusinessException("Scheduled date/time must fall within the tournament date range")`
      - Guard: another match (different id, same tournamentId excluded per spec — check all matches across any tournament) with same `fieldId` AND same `scheduledDateTime` → `ConflictException("The selected field is already booked at the requested date/time")`
      - Guard: `field.isAvailable == false` → `BusinessException("The selected field is not available")`
      - Set `match.scheduledDate = request.scheduledDateTime` and `match.fieldId` (add `fieldId` field to `TournamentMatch` if not present, or reuse `scheduledDate`; see note below)
      - Save match; return `MatchResponse`
    - Note: `TournamentMatch` entity already has `scheduledDate` (LocalDateTime); add `String fieldId` field to `TournamentMatch` and `MatchResponse` to persist the field assignment
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.8, 15.9, 15.10_
  - [ ] 18.5 Add `PUT /{id}/schedule` endpoint to `MatchController`
    - Add to `MatchController`: `@PutMapping("/{id}/schedule")`, `@PreAuthorize("hasRole('ADMIN')")`, delegates to `scheduleService.scheduleMatch(id, request)`, returns 200 with updated `MatchResponse`
    - Inject `ScheduleService` into `MatchController`
    - _Requirements: 15.1, 15.11_
  - [ ] 18.6 Write property-based tests for scheduling invariants (P15)
    - Add to `src/test/java/com/example/demo/tournament/MatchSchedulingPropertyTest.java`
    - **Property 15a: Valid schedule persists both values** — generate valid `scheduledDateTime` within tournament date range and a matching `fieldId`; assert `match.scheduledDate` and `match.fieldId` are persisted correctly — `@Property(tries = 100)`
    - **Property 15b: Date out of range always rejected** — generate `scheduledDateTime` outside `[startDate 00:00, endDate 23:59:59]`; assert `BusinessException` is thrown — `@Property(tries = 100)`
    - **Property 15c: Duplicate field+time booking rejected** — schedule a match for fieldId+time, then attempt to schedule a second match for the same fieldId+time; assert `ConflictException` — `@Property(tries = 100)`
    - _Validates: Requirements 15.1, 15.5, 15.6_
  - [ ] 18.7 Write unit tests for `ScheduleServiceImpl`
    - Create `src/test/java/com/example/demo/services/ScheduleServiceImplTest.java`
    - Test cases: match not found → 404; tournament status not bracket-ready → 409; field not found → 404; field sport mismatch → 400; date out of range → 400; field unavailable → 400; duplicate booking → 409; valid request persists values; overwrite existing schedule subject to validations
    - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.6, 15.8, 15.9, 15.10_


- [ ] 19. Score Editing (Requirement 16)
  - [ ] 19.1 Add `replaceWinner` to `BracketService` interface
    - Add to `com/example/demo/services/BracketService.java`:
      `void replaceWinner(TournamentMatch editedMatch, String oldWinnerId, String newWinnerId, ParticipantType newWinnerType, Tournament tournament)`
    - _Requirements: 16.3, 16.4_
  - [ ] 19.2 Implement `replaceWinner` in `BracketServiceImpl`
    - Implement `replaceWinner` in `BracketServiceImpl`:
      - If `editedMatch.nextMatchId == null` (this match IS the Final): update `tournament.championId = newWinnerId`, `tournament.championType = newWinnerType`, save tournament; return
      - Load `nextMatch` by `editedMatch.nextMatchId` (throw `ResourceNotFoundException` if absent)
      - Replace old winner in the correct slot: if `editedMatch.nextMatchPosition == 1` set `nextMatch.participant1Id/Type = newWinnerId/Type`, else set `nextMatch.participant2Id/Type = newWinnerId/Type`
      - If `nextMatch.status == PLAYED`: clear `nextMatch.score1`, `nextMatch.score2`, `nextMatch.winnerId`, `nextMatch.winnerType`; set `nextMatch.status = READY`; save `nextMatch`; recursively call `replaceWinner(nextMatch, oldDownstreamWinnerId, newWinnerId=null /* slot now empty */, ...)` — cascade clears downstream chain
      - If `nextMatch.status != PLAYED`: save `nextMatch` (updated slot); no further recursion needed
    - _Requirements: 16.3, 16.4, 16.5_
  - [ ] 19.3 Modify `MatchServiceImpl.recordResult` to support score editing
    - Remove the `ConflictException` guard for `match.status == PLAYED`
    - After setting `match.score1` and `match.score2`, determine new winner as before (higher score wins)
    - If `match.status == PLAYED` (score edit path):
      - Capture `oldWinnerId` and `oldWinnerType` from current match state before overwriting
      - Set `match.winnerId` and `match.winnerType` to new winner
      - If new winner equals old winner: save match, return updated `MatchResponse` (no downstream changes)
      - If winner changed: save match; call `bracketService.replaceWinner(match, oldWinnerId, newWinnerId, newWinnerType, tournament)`; return updated `MatchResponse`
    - If `match.status != PLAYED` (original first-time result path): keep existing `advanceWinner` logic unchanged
    - _Requirements: 16.1, 16.2, 16.3_
  - [ ] 19.4 Write property-based tests for score editing invariants (P16)
    - Create `src/test/java/com/example/demo/tournament/ScoreEditingPropertyTest.java`
    - **Property 16a: Winner unchanged → no downstream cascade** — record a match result, then re-submit the same winner with different scores; assert no downstream match is modified — `@Property(tries = 100)`
    - **Property 16b: Winner changed → downstream slot updated** — record a match result, then submit a score that flips the winner; assert the downstream match's participant slot is updated to the new winner — `@Property(tries = 100)`
    - **Property 16c: Recursive cascade stops at non-PLAYED match** — set up a two-match chain where the downstream match is PLAYED; flip winner in upstream match; assert downstream match reverts to READY and its downstream (non-PLAYED) is untouched — `@Property(tries = 100)`
    - _Validates: Requirements 16.2, 16.3, 16.4_
  - [ ] 19.5 Write unit tests for score editing
    - Add to `src/test/java/com/example/demo/services/MatchServiceImplTest.java` or create `ScoreEditingTest.java`
    - Test cases:
      - Winner unchanged after edit → `replaceWinner` NOT called, scores updated
      - Winner changed after edit → `replaceWinner` called with correct old/new winner ids
      - Recursive cascade: downstream PLAYED match cleared to READY, its slot replaced, further non-PLAYED downstream untouched
      - Final score edit with winner change → `tournament.championId`/`championType` updated
      - Draw in score edit → `BusinessException("Draws are not permitted in single-elimination tournaments")`
      - Negative score in edit → validation rejection (HTTP 400)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_


## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1", "4.1", "4.2", "4.3"] },
    { "id": 3, "tasks": ["3.2", "5.1", "6.1", "6.2", "6.3"] },
    { "id": 4, "tasks": ["5.2", "5.3"] },
    { "id": 5, "tasks": ["8.1", "9.1", "10.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "9.2", "9.3"] },
    { "id": 7, "tasks": ["8.4", "8.5", "9.4", "9.5", "10.2"] },
    { "id": 8, "tasks": ["8.6"] },
    { "id": 9, "tasks": ["12.1", "12.2"] },
    { "id": 10, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5", "14.6"] },
    { "id": 11, "tasks": ["15.1", "15.2", "15.3", "15.4"] },
    { "id": 12, "tasks": ["18.1", "18.2", "18.3", "19.1"] },
    { "id": 13, "tasks": ["18.4", "19.2", "19.3"] },
    { "id": 14, "tasks": ["18.5"] },
    { "id": 15, "tasks": ["18.6", "18.7", "19.4", "19.5"] }
  ]
}
```
