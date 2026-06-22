# Requirements Document

## Introduction

The Tournament Management Module adds single-elimination tournament support to the Vamos sports management platform. Administrators create and manage tournaments, each tied to exactly one Sport. Registration type (team-based or individual) is derived automatically from `Sport.teamEnabled`. The module handles participant registration, bracket generation, match result entry, winner advancement, and tournament completion — all within the existing Spring Boot 3 / MongoDB / React architecture.

---

## Glossary

- **Admin**: A platform user with the `ADMIN` role who has full control over tournament lifecycle operations.
- **Captain**: A platform user with the `CAPTAIN` role who registers and manages a team.
- **Player**: A platform user with the `PLAYER` role representing an individual competitor. Each team-sport Player has a `teamId` field referencing the Team they belong to.
- **Sport**: An existing platform entity (`sports` collection) with a `teamEnabled` flag that determines whether a tournament uses teams or individual players.
- **Tournament**: A competition entity belonging to one Sport, with a defined participant limit, a single-elimination bracket, and a date window (`startDate` – `endDate`) during which matches are played.
- **TournamentParticipant**: A registration record linking either a Team or a Player to a Tournament.
- **Field**: A physical playing venue entity (`fields` collection) with an `id`, `name`, `isAvailable` flag, and `sportId` reference.
- **FieldBooking**: A logical slot representing a Field being in use for a specific Match at a specific `scheduledDateTime`. Two matches cannot share the same Field at the same `scheduledDateTime`.
- **Schedule_Service**: The backend service component responsible for assigning and validating `scheduledDateTime` and `fieldId` on Match documents.
- **Participant**: Either a Team or a Player, depending on `Sport.teamEnabled`.
- **ParticipantType**: Enum — `TEAM` or `PLAYER`. Determined by `Sport.teamEnabled` at tournament creation time.
- **Match**: A single contest between two Participants within a bracket round.
- **Bracket**: The complete set of Matches for a Tournament, organised into rounds forming the single-elimination tree.
- **BracketResponse**: A hierarchical DTO representing the full bracket tree suitable for direct rendering by a React Tournament Bracket component.
- **TournamentStatus**: Enum — `REGISTRATION_OPEN`, `READY`, `BRACKET_GENERATED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
- **MatchStatus**: Enum — `PENDING`, `READY`, `PLAYED`.
- **MatchRound**: Enum — `QUARTER_FINAL`, `SEMI_FINAL`, `FINAL`.
- **Champion**: The Participant who wins the Final match; recorded as `championId` and `championType` on the Tournament.
- **Tournament_Service**: The backend service component responsible for tournament and registration logic.
- **Bracket_Service**: The backend service component responsible for bracket generation and winner advancement logic.
- **Match_Service**: The backend service component responsible for match result recording and status transitions.
- **Tournament_Controller**: The REST controller exposing tournament and registration endpoints.
- **Match_Controller**: The REST controller exposing match endpoints.
- **Validation_Layer**: Spring Bean Validation annotations plus custom validators enforcing business rules before service execution.
- **Player_Tournament_View**: The frontend page shown to Players listing tournaments for their sport, with read-only participation status and bracket modal access.
- **Captain_Tournament_View**: The frontend page shown to Captains listing tournaments for their team's sport, supporting team registration and bracket modal access.

---

## Requirements

### Requirement 1: Tournament Creation

**User Story:** As an Admin, I want to create a tournament for a specific sport, so that I can organise a competition with a defined structure and participant limit.

#### Acceptance Criteria

1. WHEN an Admin submits a valid `TournamentCreateRequest`, THE Tournament_Service SHALL create a Tournament document with `status = REGISTRATION_OPEN`, `registrationOpen = true`, and `participantType` derived from `Sport.teamEnabled` (TEAM if true, PLAYER if false).
2. IF `participantLimit` is not exactly `4` or `8` in a `TournamentCreateRequest`, THEN THE Validation_Layer SHALL return HTTP 400 with a descriptive validation message.
3. IF `sportId` does not reference an existing Sport document in a `TournamentCreateRequest`, THEN THE Validation_Layer SHALL return HTTP 404 with the message `"Sport not found"`.
4. IF `name` is blank (null, empty, or whitespace-only, max 255 characters), `startDate` is null, or `endDate` is null in a `TournamentCreateRequest`, THEN THE Validation_Layer SHALL return HTTP 400 with a descriptive validation message.
5. IF `endDate` is not strictly after `startDate` in a `TournamentCreateRequest`, THEN THE Validation_Layer SHALL return HTTP 400 with the message `"End date must be after start date"`.
6. IF `startDate` is in the past at the time of submission, THEN THE Validation_Layer SHALL return HTTP 400 with the message `"Start date must be today or in the future"`.
7. WHEN a Tournament is created, THE Tournament_Service SHALL set `currentParticipants = 0`, `championId = null`, `championType = null`, and record `createdAt` and `updatedAt` timestamps.
8. WHEN a non-Admin user submits a `TournamentCreateRequest`, THE Tournament_Controller SHALL return HTTP 403 Forbidden.

---

### Requirement 2: Tournament Retrieval and Update

**User Story:** As a platform user, I want to view tournament details and as an Admin I want to update or cancel a tournament, so that participants have accurate information.

#### Acceptance Criteria

1. WHEN a request is made to `GET /api/tournaments`, THE Tournament_Controller SHALL return a list of all Tournament documents as `TournamentResponse` objects.
2. WHEN a request is made to `GET /api/tournaments/{id}`, THE Tournament_Controller SHALL return the matching Tournament as a `TournamentResponse`, or HTTP 404 if the tournament does not exist.
3. WHEN an Admin submits a valid update to `PUT /api/tournaments/{id}`, THE Tournament_Service SHALL update the mutable fields (`name`, `startDate`, `endDate`) and set `updatedAt` to the current timestamp.
4. IF a Tournament has `status = COMPLETED`, THEN THE Tournament_Service SHALL reject any update request with HTTP 409 and the message `"Completed tournaments cannot be modified"`.
5. THE Validation_Layer SHALL reject a `TournamentUpdateRequest` when `endDate` is provided and is not strictly after `startDate` (or the existing `startDate` when `startDate` is not being updated), returning HTTP 400 with the message `"End date must be after start date"`.
6. WHEN an Admin sends `DELETE /api/tournaments/{id}`, THE Tournament_Service SHALL set `status = CANCELLED` and `registrationOpen = false` rather than physically deleting the document.
7. IF a Tournament has `status = COMPLETED`, THEN THE Tournament_Service SHALL reject a cancellation request with HTTP 409 and the message `"Completed tournaments cannot be modified"`.

---

### Requirement 3: Participant Registration — Teams

**User Story:** As a Captain, I want to register my team in a team-based tournament, so that my team can compete.

#### Acceptance Criteria

1. WHEN a `RegisterTeamRequest` is submitted to `POST /api/tournaments/{id}/register-team`, THE Tournament_Service SHALL create a `TournamentParticipant` record with `participantType = TEAM` if all validations pass.
2. THE Validation_Layer SHALL reject registration WHEN `Sport.teamEnabled = false` for the tournament's sport, returning HTTP 400 with the message `"This tournament only accepts individual players"`.
3. THE Validation_Layer SHALL reject registration WHEN the Team's `sportId` does not equal the Tournament's `sportId`, returning HTTP 400 with the message `"Participant sport does not match tournament sport"`.
4. THE Validation_Layer SHALL reject registration WHEN the Team is already registered in the same Tournament, returning HTTP 409 with the message `"Participant is already registered"`.
5. THE Validation_Layer SHALL reject registration WHEN `Tournament.registrationOpen = false`, returning HTTP 400 with the message `"Registration is closed for this tournament"`.
6. WHEN a Team is successfully registered, THE Tournament_Service SHALL increment `Tournament.currentParticipants` by 1.
7. WHEN `Tournament.currentParticipants` reaches `Tournament.participantLimit` after a successful registration, THE Tournament_Service SHALL set `registrationOpen = false` and `status = READY`.

---

### Requirement 4: Participant Registration — Individual Players

**User Story:** As a Player in an individual-sport (e.g. Tennis, Padel), I want to register in an individual-sport tournament, so that I can compete as an individual.

#### Acceptance Criteria

1. WHEN a `RegisterPlayerRequest` is submitted to `POST /api/tournaments/{id}/register-player`, THE Tournament_Service SHALL create a `TournamentParticipant` record with `participantType = PLAYER` if all validations pass.
2. THE Validation_Layer SHALL reject registration WHEN `Sport.teamEnabled = true` for the tournament's sport, returning HTTP 400 with the message `"This tournament only accepts teams"`.
3. THE Validation_Layer SHALL reject registration WHEN the Player's `sportId` does not equal the Tournament's `sportId`, returning HTTP 400 with the message `"Participant sport does not match tournament sport"`.
4. THE Validation_Layer SHALL reject registration WHEN the Player is already registered in the same Tournament, returning HTTP 409 with the message `"Participant is already registered"`.
5. THE Validation_Layer SHALL reject registration WHEN `Tournament.registrationOpen = false`, returning HTTP 400 with the message `"Registration is closed for this tournament"`.
6. WHEN a Player is successfully registered, THE Tournament_Service SHALL increment `Tournament.currentParticipants` by 1.
7. WHEN `Tournament.currentParticipants` reaches `Tournament.participantLimit` after a successful registration, THE Tournament_Service SHALL set `registrationOpen = false` and `status = READY`.

---

### Requirement 5: Participant Removal

**User Story:** As an Admin, I want to remove a registered participant from a tournament before the bracket is generated, so that I can correct registration errors.

#### Acceptance Criteria

1. WHEN an Admin sends `DELETE /api/tournaments/{id}/participants/{participantId}`, THE Tournament_Service SHALL delete the corresponding `TournamentParticipant` document and decrement `Tournament.currentParticipants` by 1.
2. IF the Tournament's `status` is `BRACKET_GENERATED`, `IN_PROGRESS`, or `COMPLETED`, THEN THE Tournament_Service SHALL reject the removal request with HTTP 409 and the message `"Participants cannot be removed after the bracket has been generated"`.
3. WHEN a participant is removed and `Tournament.registrationOpen = false` and `Tournament.status = READY`, THE Tournament_Service SHALL set `registrationOpen = true` and `status = REGISTRATION_OPEN`.

---

### Requirement 6: Bracket Generation

**User Story:** As an Admin, I want the bracket to be generated automatically when the tournament is full, so that match pairings are ready without manual effort.

#### Acceptance Criteria

1. WHEN `Tournament.currentParticipants` equals `Tournament.participantLimit` and `status` transitions to `READY`, THE Bracket_Service SHALL automatically generate all Match documents for the tournament and set `Tournament.status = BRACKET_GENERATED`.
2. WHEN generating a bracket for a 4-participant Tournament, THE Bracket_Service SHALL create 3 Match documents: Semi_Final_1 (`P1 vs P2`), Semi_Final_2 (`P3 vs P4`), and Final (`nextMatchId` pointing to the Final for both semi-finals).
3. WHEN generating a bracket for an 8-participant Tournament, THE Bracket_Service SHALL create 7 Match documents: 4 Quarter_Final matches, 2 Semi_Final matches, and 1 Final match, with `nextMatchId` and `nextMatchPosition` set correctly on each match.
4. THE Bracket_Service SHALL assign `status = READY` to all first-round matches (Quarter_Finals for 8-participant; Semi_Finals for 4-participant) and `status = PENDING` to all subsequent-round matches at generation time.
5. WHEN a request is made to `GET /api/tournaments/{id}/bracket`, THE Tournament_Controller SHALL return a `BracketResponse` containing the complete hierarchical bracket tree ordered `QUARTER_FINAL → SEMI_FINAL → FINAL → Champion`, suitable for direct rendering in a React Tournament Bracket component without additional frontend calculations.
6. WHEN an Admin manually calls `POST /api/tournaments/{id}/generate-bracket` and the Tournament `status` is already `BRACKET_GENERATED`, THE Tournament_Controller SHALL return HTTP 409 with the message `"Bracket has already been generated"`.
7. IF `Tournament.currentParticipants` is less than `Tournament.participantLimit` when `POST /api/tournaments/{id}/generate-bracket` is called, THEN THE Tournament_Controller SHALL return HTTP 400 with the message `"Tournament is not full yet"`.

---

### Requirement 7: Match Result Entry

**User Story:** As an Admin, I want to enter the result of a match by providing both scores, so that the system can determine the winner and advance them automatically.

#### Acceptance Criteria

1. WHEN an Admin submits a `MatchResultRequest` to `PUT /api/matches/{id}/result` with `score1` and `score2`, THE Match_Service SHALL record the scores, determine the winner as the Participant with the higher score, set `winnerId` and `winnerType`, and set `match.status = PLAYED`.
2. THE Validation_Layer SHALL reject a `MatchResultRequest` WHEN `score1` or `score2` is negative, returning HTTP 400 with a descriptive validation message.
3. THE Validation_Layer SHALL reject a `MatchResultRequest` WHEN `score1 == score2` (a draw), returning HTTP 400 with the message `"Draws are not permitted in single-elimination tournaments"`.
4. IF a Match has `status = PENDING`, THEN THE Match_Service SHALL reject result submission with HTTP 400 and the message `"Match is not ready to receive results"`.
5. WHEN a `MatchResultRequest` is submitted by a non-Admin user, THE Match_Controller SHALL return HTTP 403 Forbidden.

---

### Requirement 8: Automatic Winner Advancement

**User Story:** As a platform user, I want winners to advance to the next round automatically after each result is entered, so that the bracket progresses without manual intervention.

#### Acceptance Criteria

1. WHEN a Match with `status = PLAYED` has a `nextMatchId`, THE Bracket_Service SHALL place the `winnerId` and `winnerType` into the designated slot (`nextMatchPosition`) of the next Match document.
2. WHEN both participant slots of a subsequent-round Match are filled, THE Bracket_Service SHALL set that match's `status = READY`.
3. WHEN the Final Match `status` transitions to `PLAYED`, THE Bracket_Service SHALL set `Tournament.championId = match.winnerId`, `Tournament.championType = match.winnerType`, and `Tournament.status = COMPLETED`.
4. WHILE `Tournament.status = IN_PROGRESS`, THE Tournament_Service SHALL set `Tournament.status = IN_PROGRESS` when the first match result is recorded.
5. WHEN `Tournament.status = COMPLETED`, THE Tournament_Service SHALL set `registrationOpen = false` permanently.

---

### Requirement 9: Match Retrieval

**User Story:** As a platform user, I want to view all matches for a tournament and individual match details, so that I can follow the competition progress.

#### Acceptance Criteria

1. WHEN a request is made to `GET /api/tournaments/{id}/matches`, THE Tournament_Controller SHALL return a list of all Match documents for the given tournament as `MatchResponse` objects.
2. WHEN a request is made to `GET /api/matches/{id}`, THE Match_Controller SHALL return the matching Match as a `MatchResponse`, or HTTP 404 if the match does not exist.
3. THE Match_Controller SHALL return HTTP 404 with the message `"Match not found"` WHEN a `matchId` that does not exist is requested.

---

### Requirement 10: Participant Listing

**User Story:** As a platform user, I want to view all registered participants for a tournament, so that I can see who is competing.

#### Acceptance Criteria

1. WHEN a request is made to `GET /api/tournaments/{id}/participants`, THE Tournament_Controller SHALL return a list of all `TournamentParticipant` documents for the given tournament as `TournamentParticipantResponse` objects.
2. THE Tournament_Controller SHALL return HTTP 404 WHEN the requested `tournamentId` does not correspond to an existing Tournament.

---

### Requirement 11: Data Integrity and Persistence

**User Story:** As a system operator, I want tournament data to be stored reliably and consistently in MongoDB, so that no data is lost and queries are performant.

#### Acceptance Criteria

1. THE Tournament_Service SHALL store Tournament documents in the `tournaments` MongoDB collection with indexes on `sportId` and `status`.
2. THE Tournament_Service SHALL store TournamentParticipant documents in the `tournament_participants` MongoDB collection with a compound index on `(tournamentId, participantId)` to enforce uniqueness.
3. THE Match_Service SHALL store Match documents in the `matches` MongoDB collection with an index on `tournamentId`.
4. WHEN any write operation fails due to a database error, THE Tournament_Service SHALL propagate a 500 Internal Server Error response with a generic error message, without exposing internal stack traces.
5. THE Tournament_Service SHALL update `Tournament.updatedAt` on every state-changing write operation.

---

### Requirement 12: API Security

**User Story:** As a system operator, I want all tournament endpoints to enforce JWT-based authentication and role-based access, so that only authorised users can perform sensitive operations.

#### Acceptance Criteria

1. THE Tournament_Controller SHALL require a valid JWT token on all endpoints; requests without a valid token SHALL receive HTTP 401 Unauthorised.
2. THE Tournament_Controller SHALL restrict tournament creation (`POST /api/tournaments`), update (`PUT /api/tournaments/{id}`), deletion (`DELETE /api/tournaments/{id}`), participant removal, and bracket generation to users with the `ADMIN` role, returning HTTP 403 for any other role.
3. THE Match_Controller SHALL restrict match result entry (`PUT /api/matches/{id}/result`) to users with the `ADMIN` role, returning HTTP 403 for any other role.
4. THE Tournament_Controller SHALL allow read operations (`GET /api/tournaments`, `GET /api/tournaments/{id}`, `GET /api/tournaments/{id}/participants`, `GET /api/tournaments/{id}/bracket`, `GET /api/tournaments/{id}/matches`) to any authenticated user regardless of role.
5. WHERE a Captain is registering a team, THE Tournament_Controller SHALL require the requestor to hold the `CAPTAIN` role for `POST /api/tournaments/{id}/register-team`, returning HTTP 403 otherwise.
6. WHERE a Player is registering, THE Tournament_Controller SHALL require the requestor to hold the `PLAYER` role for `POST /api/tournaments/{id}/register-player`, returning HTTP 403 otherwise.

---

### Requirement 13: Player Tournament View (Read-Only)

**User Story:** As a team-sport Player, I want to view tournaments for my sport and see whether my team is participating, so that I can follow my team's competition status without being able to register myself.

#### Acceptance Criteria

1. WHEN a Player navigates to the Tournaments page, THE Player_Tournament_View SHALL display all tournaments whose `sportId` matches the player's sport, regardless of tournament status.
2. THE Player_Tournament_View SHALL NOT present any registration action or button; Players in team-sport tournaments cannot register independently.
3. WHILE displaying a tournament, THE Player_Tournament_View SHALL call `GET /api/tournaments/{id}/participants` and display a "Participating" label if the player's `teamId` is found in the returned list, or a "Not Participating" label if it is not.
4. IF a tournament has `status = BRACKET_GENERATED`, `IN_PROGRESS`, or `COMPLETED`, THEN THE Player_Tournament_View SHALL render that tournament's row or card with a pointer cursor and visually active state to indicate it is clickable.
5. WHEN a Player clicks a tournament with `status = BRACKET_GENERATED`, `IN_PROGRESS`, or `COMPLETED`, THE Player_Tournament_View SHALL open a bracket modal displaying all rounds and match slots returned by `GET /api/tournaments/{id}/bracket`.
6. IF a tournament has `status = REGISTRATION_OPEN`, `READY`, or `CANCELLED`, THEN THE Player_Tournament_View SHALL display the tournament row or card without pointer cursor, with no click handler attached, and with no bracket modal.
7. IF the player's `teamId` is null or empty (individual-sport player), THEN THE Player_Tournament_View SHALL call `GET /api/tournaments/{id}/participants` and display a "Participating" label if the player's own `playerId` is found in the returned list, or a "Not Participating" label if it is not.
8. IF the `GET /api/tournaments/{id}/participants` call fails for any tournament, THEN THE Player_Tournament_View SHALL display an error state in the participation column for that tournament rather than crashing the page.
9. IF the `GET /api/tournaments/{id}/bracket` call fails after a Player clicks a tournament, THEN THE Player_Tournament_View SHALL display an error message inside the bracket modal rather than leaving the modal empty or crashing.

---

### Requirement 14: Captain Bracket Viewing

**User Story:** As a Captain, I want to view the bracket for a tournament once it has been generated, so that I can follow my team's match schedule and results.

#### Acceptance Criteria

1. WHEN a Captain navigates to the Tournaments page, THE Captain_Tournament_View SHALL display all tournaments whose `sportId` matches the captain's team sport.
2. IF a tournament has `status = BRACKET_GENERATED`, `IN_PROGRESS`, or `COMPLETED`, THEN THE Captain_Tournament_View SHALL render that tournament's row or card with a pointer cursor and visually active state to indicate it is clickable.
3. WHEN a Captain clicks a tournament with `status = BRACKET_GENERATED`, `IN_PROGRESS`, or `COMPLETED`, THE Captain_Tournament_View SHALL open a bracket modal displaying all rounds and match slots returned by `GET /api/tournaments/{id}/bracket`.
4. IF a tournament has `status = REGISTRATION_OPEN` or `READY` and `registrationOpen = true` and the captain's team is not yet registered, THEN THE Captain_Tournament_View SHALL display a "Register My Team" button that submits `POST /api/tournaments/{id}/register-team` when clicked.
5. IF the captain's team is already registered in a tournament, THEN THE Captain_Tournament_View SHALL display a "Registered" badge for that tournament.
6. WHEN a Captain's team is already registered in a tournament, THE Captain_Tournament_View SHALL hide the "Register My Team" button for that tournament.
7. IF the `GET /api/tournaments/{id}/bracket` call fails after a Captain clicks a tournament, THEN THE Captain_Tournament_View SHALL display an error message inside the bracket modal rather than leaving the modal empty or crashing.

---

### Requirement 15: Match Scheduling

**User Story:** As an Admin, I want to assign a date/time and a field to each match once the bracket is ready, so that participants know when and where to show up.

#### Acceptance Criteria

1. WHEN an Admin submits a `MatchScheduleRequest` to `PUT /api/matches/{id}/schedule` with a `scheduledDateTime` and `fieldId`, THE Schedule_Service SHALL persist both values on the Match document and return the updated `MatchResponse`.
2. IF the Tournament `status` is not `BRACKET_GENERATED`, `IN_PROGRESS`, or `COMPLETED` when a `MatchScheduleRequest` is received, THEN THE Validation_Layer SHALL return HTTP 409 with the message `"Match scheduling is not available until the bracket has been generated"`.
3. IF `fieldId` does not reference an existing Field document, THEN THE Validation_Layer SHALL return HTTP 404 with the message `"Field not found"`.
4. IF the Field's `sportId` does not equal the Tournament's `sportId`, THEN THE Validation_Layer SHALL return HTTP 400 with the message `"Field sport does not match tournament sport"`.
5. IF `scheduledDateTime` is before `Tournament.startDate` (interpreted as 00:00:00 on that date) or after `Tournament.endDate` (interpreted as 23:59:59 on that date), THEN THE Validation_Layer SHALL return HTTP 400 with the message `"Scheduled date/time must fall within the tournament date range"`.
6. IF another Match (excluding the Match being scheduled) already has the same `fieldId` and the same `scheduledDateTime`, THEN THE Schedule_Service SHALL return HTTP 409 with the message `"The selected field is already booked at the requested date/time"`.
7. IF `scheduledDateTime` is null or `fieldId` is null or blank, THEN THE Validation_Layer SHALL return HTTP 400 with a descriptive validation message.
8. IF `Field.isAvailable = false`, THEN THE Validation_Layer SHALL return HTTP 400 with the message `"The selected field is not available"`.
9. IF the `matchId` in `PUT /api/matches/{id}/schedule` does not reference an existing Match, THEN THE Match_Controller SHALL return HTTP 404 with the message `"Match not found"`.
10. WHEN a `MatchScheduleRequest` is submitted for a Match that already has a `scheduledDateTime` and `fieldId`, THE Schedule_Service SHALL overwrite the existing values (subject to all validations) and return the updated `MatchResponse`.
11. WHEN a `MatchScheduleRequest` is submitted by a non-Admin user, THE Match_Controller SHALL return HTTP 403 Forbidden.

---

### Requirement 16: Score Editing

**User Story:** As an Admin, I want to correct a previously recorded match score, so that bracket standings reflect the accurate result when a data-entry mistake has been made.

#### Acceptance Criteria

1. WHEN an Admin submits a `MatchResultRequest` to `PUT /api/matches/{id}/result` for a Match with `status = PLAYED`, THE Match_Service SHALL overwrite `score1`, `score2`, and re-determine `winnerId` and `winnerType` as the Participant with the higher score.
2. IF the newly determined winner equals the existing `winnerId`, THEN THE Match_Service SHALL update scores only and SHALL NOT trigger any downstream bracket changes.
3. WHEN the winner changes as a result of a score edit, THE Bracket_Service SHALL replace the old winner's entry in the `nextMatchId` slot (at `nextMatchPosition`) with the new winner's `id` and `type`.
4. WHEN the winner changes and the downstream Match at `nextMatchId` has `status = PLAYED`, THE Bracket_Service SHALL: (a) clear `score1`, `score2`, `winnerId`, and `winnerType` from that downstream Match, (b) set its `status = READY`, (c) place the corrected upstream winner into the correct slot, and (d) recursively apply this same re-evaluation logic up the bracket chain until a Match with `status != PLAYED` is reached or the chain ends at the Final.
5. WHEN the edited Match is the Final and the winner changes, THE Tournament_Service SHALL update `Tournament.championId` and `Tournament.championType` to reflect the new winner.
6. IF `score1` or `score2` is negative in a score-edit `MatchResultRequest`, THEN THE Validation_Layer SHALL return HTTP 400 with a descriptive validation message.
7. IF `score1 == score2` (a draw) in a score-edit `MatchResultRequest`, THEN THE Validation_Layer SHALL return HTTP 400 with the message `"Draws are not permitted in single-elimination tournaments"`.
8. WHEN a score-edit `MatchResultRequest` is submitted by a non-Admin user, THE Match_Controller SHALL return HTTP 403 Forbidden.
