## ADDED Requirements

### Requirement: Profile access is a basic account right
A member account SHALL be able to view and edit its own personal profile regardless of membership package status.

#### Scenario: Fresh account opens profile
- **WHEN** a member with no `member_profiles` row requests `GET /members/me`
- **THEN** the backend MUST create an empty profile (UserId + JoinedAt only), audit it as self-service, and return it

#### Scenario: Member edits own profile
- **WHEN** a member submits `PUT /members/me` with any subset of fullName, phone, dateOfBirth, gender, address, emergencyContact
- **THEN** only the submitted fields MUST be updated and the phone dedup rule MUST still return 409 `DUPLICATE` on conflict

#### Scenario: Profile page not gated by package
- **WHEN** an authenticated member without any membership opens `/member/profile`
- **THEN** the page MUST render the profile form (no `MembershipGate` lock screen)

#### Scenario: Session picks up lazy-created profile
- **WHEN** `GET /members/me` returns a profile and the auth session has `memberProfileId = null`
- **THEN** the frontend MUST store the returned profile id in the auth session without requiring re-login

#### Scenario: Read-only identity fields
- **WHEN** the profile page renders
- **THEN** email, member code, and joined date MUST be displayed read-only (email change is out of scope)

#### Scenario: Concurrent first access
- **WHEN** two `GET /members/me` requests race for an account with no profile
- **THEN** exactly one profile row MUST exist afterwards (unique index on UserId) and both requests MUST succeed
