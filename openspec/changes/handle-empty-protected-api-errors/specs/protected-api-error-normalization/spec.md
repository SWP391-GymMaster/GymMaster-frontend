## ADDED Requirements

### Requirement: Protected empty responses are normalized
The frontend API client SHALL convert protected backend responses without a parseable JSON envelope into domain-specific API errors for authentication and authorization failures.

#### Scenario: Empty unauthorized response
- **WHEN** the backend returns HTTP `401` without a parseable JSON response body
- **THEN** the API client MUST throw an `ApiClientError` with code `UNAUTHORIZED` and status `401`

#### Scenario: Empty forbidden response
- **WHEN** the backend returns HTTP `403` without a parseable JSON response body
- **THEN** the API client MUST throw an `ApiClientError` with code `FORBIDDEN` and status `403`

#### Scenario: Structured backend error response
- **WHEN** the backend returns a structured GymMaster JSON error envelope
- **THEN** the API client MUST preserve the backend error code, message, request id, and HTTP status

#### Scenario: Non-protected invalid response
- **WHEN** the backend returns a non-JSON response for an HTTP status other than `401` or `403`
- **THEN** the API client MUST throw an `ApiClientError` with code `INVALID_RESPONSE`

#### Scenario: No content response
- **WHEN** the backend returns HTTP `204`
- **THEN** the API client MUST keep the existing no-content behavior
