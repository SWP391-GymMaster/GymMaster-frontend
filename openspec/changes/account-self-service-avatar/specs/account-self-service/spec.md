## ADDED Requirements

### Requirement: Every signed-in account manages its basic identity
Any authenticated user, regardless of role, SHALL be able to update their own display name, phone, and avatar image; email, role, and status SHALL remain non-self-editable.

#### Scenario: Any role updates name/phone
- **WHEN** an authenticated user of any role sends `PUT /users/me` with FullName and/or Phone
- **THEN** only the submitted fields MUST be updated, with phone normalization and duplicate check (409 `DUPLICATE`) preserved

#### Scenario: Any role uploads an avatar
- **WHEN** an authenticated user posts a jpeg/png/webp file ≤ 5 MB to `POST /users/me/avatar`
- **THEN** the image MUST be stored via the avatar storage service and the returned URL saved to `users.AvatarUrl`

#### Scenario: Invalid avatar upload rejected
- **WHEN** the file is not jpeg/png/webp or exceeds 5 MB
- **THEN** the API MUST reject with a validation error and MUST NOT call the storage service

#### Scenario: Storage not configured
- **WHEN** Cloudinary credentials are absent from configuration
- **THEN** avatar upload MUST fail with `CLOUDINARY_NOT_CONFIGURED` and no partial state

#### Scenario: Google first login seeds avatar
- **WHEN** a new account is created via Google login and the verified payload includes a picture URL
- **THEN** `users.AvatarUrl` MUST be initialized from it

### Requirement: Avatar display with initials fallback
Wherever the user identity is rendered (header menu trigger, member profile view identity block, account dialog), the avatar image SHALL be shown when present and initials derived from the full name SHALL be shown otherwise.

#### Scenario: No avatar set
- **WHEN** a user without `AvatarUrl` views the header
- **THEN** the identity circle MUST render name initials, never an empty/broken image

#### Scenario: Avatar updated in session
- **WHEN** an upload succeeds
- **THEN** the header and open views MUST reflect the new image without re-login
