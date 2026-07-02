## MODIFIED Requirements

### Requirement: Header identity button opens a user menu
The `WorkspaceShell` header identity button SHALL open a user menu instead of directly opening the theme settings dialog.

#### Scenario: Member opens the menu
- **WHEN** a member clicks the header identity button
- **THEN** the menu MUST offer: Hồ sơ của tôi, Cấu hình giao diện, Đổi mật khẩu, Đăng xuất

#### Scenario: Non-member roles open the menu
- **WHEN** an admin, staff, or PT user clicks the header identity button
- **THEN** the menu MUST offer Cấu hình giao diện, Đổi mật khẩu, Đăng xuất and MUST NOT offer Hồ sơ của tôi

#### Scenario: Theme settings still reachable
- **WHEN** any role selects "Cấu hình giao diện"
- **THEN** the existing `SettingsDialog` MUST open unchanged

#### Scenario: No role leakage
- **WHEN** the menu renders
- **THEN** it MUST NOT display other roles or become a role switcher (AGENTS.md auth rules)
