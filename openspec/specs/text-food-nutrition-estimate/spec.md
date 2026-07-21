# text-food-nutrition-estimate Specification

## Purpose
TBD - created by archiving change add-text-food-nutrition-estimate. Update Purpose after archive.
## Requirements
### Requirement: Estimate nutrition from one general ingredient name

The system SHALL allow an eligible Member to request an AI nutrition estimate for one general food or ingredient name without requiring cut, brand, or cooking-method variants.

#### Scenario: General ingredient estimate succeeds

- **WHEN** an eligible Member submits a valid name such as `gà ta`
- **THEN** the system SHALL return estimated calories, protein, carbs, and fat per 100g with source `AI`

#### Scenario: Name is invalid

- **WHEN** the submitted name is blank, shorter than 2 characters, or longer than 150 characters
- **THEN** the system SHALL return a validation error and SHALL NOT call Gemini

#### Scenario: Member has no active membership

- **WHEN** a Member without an active membership requests an estimate
- **THEN** the system SHALL return `MEMBERSHIP_REQUIRED`

#### Scenario: Gemini is unavailable

- **WHEN** Gemini times out, is unavailable, or returns malformed nutrition data
- **THEN** the UI SHALL show an error while retaining the manual-entry form as a fallback

### Requirement: Estimate requires review before persistence

The system SHALL treat text-based AI nutrition as a draft and SHALL NOT save it automatically.

#### Scenario: AI populates the custom-food form

- **WHEN** an estimate succeeds
- **THEN** the frontend SHALL populate the name, unit, calories, protein, carbs, and fat fields for review

#### Scenario: Member confirms the draft

- **WHEN** the Member reviews or edits the populated fields and submits the form
- **THEN** the existing custom-food creation API SHALL persist the food item

### Requirement: Quantity input focus stability

The meal quantity input SHALL remain focused while its value causes calorie and macro previews to rerender.

#### Scenario: Member types a multi-digit quantity

- **WHEN** a Member focuses the quantity input and types multiple digits
- **THEN** every digit SHALL be accepted without requiring the Member to focus the input again

