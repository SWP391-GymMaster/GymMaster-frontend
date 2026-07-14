# Graph Report - src  (2026-07-13)

## Corpus Check
- 328 files · ~152,802 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1757 nodes · 4892 edges · 88 communities (80 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Staff Billing Payments
- Notifications And Insights
- Account Profile APIs
- Admin Dashboard Analytics
- Public Navigation Experience
- Admin Workspace Routes
- Workout Form Controls
- PT Dashboard Workspace
- Status And Select Controls
- Dialog Action Components
- PT Assignment Workflow
- Member Management API
- Member Management Mutations
- Role Aware Member 360
- PT Training Workspaces
- Staff Front Desk Models
- Package Sales Wizards
- Nutrition Sheet Forms
- Authentication Session API
- Dropdown Tabs Controls
- Calorie Summary Workspace
- Staff Operations API
- App Root Providers
- Member 360 Timeline
- Progress Tracking
- Exercise Library UI
- Food Scanning API
- Member Social Profile
- Password Recovery Forms
- PT Training API
- Meal Logging API
- Core Mock Data
- Profile Feedback States
- Management Form Components
- Test Session Utilities
- Management Validation Schemas
- Dashboard Mock Handlers
- HTTP Error Handling
- Authentication Mock Handlers
- Authentication Pages
- Google Authentication
- Online Food Search
- UX Baseline Screenshots
- Staff Search Payments
- Member 360 Queries
- Role Profile Pages
- Permission Guard States
- External Nutrition API
- Member Training Views
- Page Motion Feedback
- Mock Service Worker
- Training Mock Handlers
- Staff Check In
- User Avatar Components
- Role Navigation Helpers
- Member Protected Routes
- Person Form Validation
- Member 360 API
- Member Hero Component
- VNPay Membership Flow
- Management Edit Dialogs
- Nutrition Mock Handlers
- Nutrition Test Server
- Social Feed Builders
- Nutrition Component Tests
- Membership Renewal Logic
- Workout Rest Timer
- Nutrition Asset Mapping
- Mobile UX Tests
- Progress Mock Handlers
- Billing E2E Flow
- Progress E2E Flow
- Avatar Image Tests
- Admin E2E Flow
- Auth E2E Flow
- Client Upgrade Tests
- Nutrition E2E Flow
- Food Search E2E
- PT E2E Flow
- Staff E2E Flow
- Visual Screenshot Tests
- Admin Route Constants
- Backend Contract Tests
- Member 360 Routes

## God Nodes (most connected - your core abstractions)
1. `cn()` - 164 edges
2. `apiRequest()` - 88 edges
3. `useAuthSessionStore` - 74 edges
4. `formatVnDate()` - 50 edges
5. `Button()` - 38 edges
6. `StateBlock()` - 34 edges
7. `resetAuthSessionForTest()` - 33 edges
8. `vnTodayIso()` - 28 edges
9. `WorkspaceShell()` - 27 edges
10. `StatusPill()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `MobileNavItem()` --calls--> `cn()`  [EXTRACTED]
  components/layout/CommandRail.tsx → lib/utils.ts
- `MobileMoreItem()` --calls--> `cn()`  [EXTRACTED]
  components/layout/CommandRail.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `SheetFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (88 total, 8 thin omitted)

### Community 0 - "Staff Billing Payments"
Cohesion: 0.05
Nodes (68): formatPrice(), PaymentQueueRow(), QueueRow, StaffPaymentsPageContent(), getCurrentUser(), authHeaders(), cancelMembership(), confirmMembershipPayment() (+60 more)

### Community 1 - "Notifications And Insights"
Cohesion: 0.05
Nodes (61): badgeColors, iconMap, NotificationsDrawer(), NotificationsDrawerProps, typeLabels, useCurrentMemberProfileId(), getDaysLeft(), MembershipExpiryBanner() (+53 more)

### Community 2 - "Account Profile APIs"
Cohesion: 0.06
Nodes (58): Status, authHeaders(), getMyPersonalProfile(), getMyTrainerProfile(), MyPersonalProfile, MyTrainerProfile, normalizePersonalProfile(), normalizeTrainerProfile() (+50 more)

### Community 3 - "Admin Dashboard Analytics"
Cohesion: 0.07
Nodes (47): authHeaders(), getAuditLogs(), getDashboardSummary(), adminDashboardKeys, useAdminAccessToken(), useAuditLogs(), useDashboardSummary(), AuditLogFilters() (+39 more)

### Community 4 - "Public Navigation Experience"
Cohesion: 0.06
Nodes (38): AboutPage(), ACCENT, DEMO_ACCOUNTS, INNOVATIONS, TECH_STACK, WORKSPACE_CARDS, DEMO_ACCOUNTS, ONBOARDING_SLIDES (+30 more)

### Community 5 - "Admin Workspace Routes"
Cohesion: 0.06
Nodes (20): AdminDashboardContent(), formatCompactVnd(), formatVnd(), AdminPageFrame(), AdminPageFrameProps, DashboardMetricCard(), DashboardMetricCardProps, iconColorStyles (+12 more)

### Community 6 - "Workout Form Controls"
Cohesion: 0.07
Nodes (37): SelectGroup(), SelectLabel(), defaultExercise, ExerciseEditorStep(), formatEnvironment(), formatGoal(), formatSplit(), getCustomPresets() (+29 more)

### Community 7 - "PT Dashboard Workspace"
Cohesion: 0.10
Nodes (26): CheckInEntry, CheckInTimeline(), CheckInTimelineProps, formatDate(), formatTime(), authHeaders(), createPtCheckIn(), getPtAssignedMembers() (+18 more)

### Community 8 - "Status And Select Controls"
Cohesion: 0.15
Nodes (25): statusLabels, StatusPill(), StatusPillProps, statusStyles, GenderSelectProps, DialogTrigger(), Input(), Select() (+17 more)

### Community 9 - "Dialog Action Components"
Cohesion: 0.13
Nodes (24): Button(), buttonVariants, Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle() (+16 more)

### Community 10 - "PT Assignment Workflow"
Cohesion: 0.11
Nodes (29): assignTrainer(), authHeaders(), getAssignmentCandidateMembers(), getAssignmentCandidateTrainers(), withSearchParams(), ptAssignmentKeys, useAccessToken(), useAssignmentCandidateMembers() (+21 more)

### Community 11 - "Member Management API"
Cohesion: 0.16
Nodes (32): authHeaders(), createManagedMember(), createManagedTrainer(), createManagedUser(), deleteManagedMember(), deleteManagedUser(), getManagedMembers(), getManagedTrainers() (+24 more)

### Community 12 - "Member Management Mutations"
Cohesion: 0.12
Nodes (28): useAccessToken(), useCreateManagedTrainer(), useCreateManagedUser(), useDeleteManagedMember(), useDeleteManagedUser(), useManagedUsers(), useResetManagedUserPassword(), useUpdateManagedUserStatus() (+20 more)

### Community 13 - "Role Aware Member 360"
Cohesion: 0.08
Nodes (26): accessLabel(), ActionRail(), ageLabel(), AssignedTrainerPanel(), CheckInRhythmCard(), contextDescriptions, contextLabels, formatDateTime() (+18 more)

### Community 14 - "PT Training Workspaces"
Cohesion: 0.08
Nodes (16): ExerciseFilter, exerciseFilters, TrainerNoteForm(), TrainerNoteFormProps, TrainingMemberContext(), TrainingMemberContextProps, TrainerNoteFormValues, trainerNoteSchema (+8 more)

### Community 15 - "Staff Front Desk Models"
Cohesion: 0.13
Nodes (28): normalizeMemberSummary(), normalizePackage(), toCheckInFeedItem(), CheckInResult, CheckInSummary, ManualPaymentDraft, ManualPaymentResult, MembershipSnapshot (+20 more)

### Community 16 - "Package Sales Wizards"
Cohesion: 0.12
Nodes (24): today, CheckInResultPanelProps, initials(), OrderSummaryShell(), OrderSummaryShellProps, PackageCard(), PackageCardProps, PaymentCompleteBanner() (+16 more)

### Community 17 - "Nutrition Sheet Forms"
Cohesion: 0.10
Nodes (22): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), MacroPill() (+14 more)

### Community 18 - "Authentication Session API"
Cohesion: 0.15
Nodes (26): login(), loginWithGoogle(), logout(), refreshSession(), registerMember(), normalizeAuthUser(), normalizeLoginSuccess(), RawAuthUser (+18 more)

### Community 19 - "Dropdown Tabs Controls"
Cohesion: 0.11
Nodes (21): DialogOverlay(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+13 more)

### Community 20 - "Calorie Summary Workspace"
Cohesion: 0.13
Nodes (18): CalorieSummaryWorkspace(), formatDisplayDate(), formatMacroGrams(), formatMacroTarget(), getMacroPercent(), MacroTrack(), MealDetailSheet(), MealKey (+10 more)

### Community 21 - "Staff Operations API"
Cohesion: 0.18
Nodes (26): authHeaders(), createStaffCheckIn(), getCheckInsDto(), getMembershipsDto(), getPackagesDto(), getStaffMemberDetail(), getStaffPackages(), getStaffTodayCheckIns() (+18 more)

### Community 22 - "App Root Providers"
Cohesion: 0.11
Nodes (14): geistMono, interSans, metadata, RootLayout(), AppProviders(), AppProvidersProps, Window, createQueryClient() (+6 more)

### Community 23 - "Member 360 Timeline"
Cohesion: 0.16
Nodes (19): useMemberCheckIns(), buildActivityEvents(), formatDateTime(), Member360Content(), Member360ContentProps, getAdminActions(), getMemberActions(), getPtActions() (+11 more)

### Community 24 - "Progress Tracking"
Cohesion: 0.16
Nodes (16): authHeaders(), createProgressEntry(), getMemberProgress(), memberProgressKeys, useAccessToken(), useCreateProgressEntry(), useCurrentMemberProfileId(), useMemberProgress() (+8 more)

### Community 25 - "Exercise Library UI"
Cohesion: 0.11
Nodes (19): Checkbox(), DropdownMenu(), DropdownMenuTrigger(), ExerciseLibraryItem(), AddExerciseDialog(), AddExerciseDialogProps, CoachWorkoutPlanCard(), DefaultWorkoutPlanCard() (+11 more)

### Community 26 - "Food Scanning API"
Cohesion: 0.13
Nodes (22): confirmAiFood(), fetchFoodByBarcode(), FoodScanDraft, FoodScanItem, FoodScanResult, MEAL_TYPE_TO_BYTE, normalizeExternalFood(), OpenFoodFactsProduct (+14 more)

### Community 27 - "Member Social Profile"
Cohesion: 0.10
Nodes (15): feedIcons, FeedItem, FeedKind, feedLabels, formatShortDate(), HighlightStrip(), MembershipSocialSection(), MemberSocialProfileProps (+7 more)

### Community 28 - "Password Recovery Forms"
Cohesion: 0.14
Nodes (17): changePassword(), forgotPassword(), resetPassword(), ForgotPasswordForm(), ResetPasswordFormProps, ChangePasswordFormValues, changePasswordSchema, ForgotPasswordFormValues (+9 more)

### Community 29 - "PT Training API"
Cohesion: 0.23
Nodes (22): authHeaders(), createMemberTrainerNote(), createMemberWorkoutPlan(), deleteTrainerNote(), deleteWorkoutPlan(), getMemberTrainerNotes(), getMemberWorkoutPlans(), getMyTrainerNotes() (+14 more)

### Community 30 - "Meal Logging API"
Cohesion: 0.21
Nodes (21): authHeaders(), createCustomFoodItem(), createMemberMealLog(), getMemberCalorieHistory(), getMemberCalorieSummary(), getMemberCalorieTarget(), getMemberMealLogs(), setMemberCalorieTarget() (+13 more)

### Community 31 - "Core Mock Data"
Cohesion: 0.10
Nodes (20): brands, mealPortions, members, MockAuditLog, MockMember, MockMembership, MockPackage, MockPayment (+12 more)

### Community 32 - "Profile Feedback States"
Cohesion: 0.12
Nodes (16): defaultIcons, iconClasses, StateBlock(), StateBlockProps, StateBlockTone, toneClasses, AccountAvatarUploader(), emptyFormValues (+8 more)

### Community 33 - "Management Form Components"
Cohesion: 0.16
Nodes (14): GenderSelect(), PhoneField, PhoneFieldProps, AdminUsersTemplateWorkspace(), CreateUserForm(), initials(), isOperationalRole(), roleLabel() (+6 more)

### Community 34 - "Test Session Utilities"
Cohesion: 0.21
Nodes (9): resetAuthSessionForTest(), renderWithAdminSession(), setAdminSessionForTest(), renderWithRole(), setSessionForTest(), pendingMembership, renewalWindow(), renderWithStaffSession() (+1 more)

### Community 35 - "Management Validation Schemas"
Cohesion: 0.10
Nodes (19): bioSchema, CreateMemberFormValues, createMemberSchema, CreateTrainerFormValues, createTrainerSchema, CreateUserFormValues, createUserSchema, emailSchema (+11 more)

### Community 36 - "Dashboard Mock Handlers"
Cohesion: 0.17
Nodes (12): auditLogs, userAccounts, dashboardAuditHandlers, memberHandlers, ApiResponseInit, fail(), getPage(), getRoleFromRequest() (+4 more)

### Community 37 - "HTTP Error Handling"
Cohesion: 0.15
Nodes (15): MemberManagementError, mapMemberManagementError(), messages, emptyProtectedResponseErrors, fallbackError, getApiUrl(), isAuthFlowPath(), normalizeApiPath() (+7 more)

### Community 38 - "Authentication Mock Handlers"
Cohesion: 0.11
Nodes (8): baseDemoUsers, cloneDemoUsers(), demoPasswords, demoUsers, resetAuthMockState(), userRoles, validRefreshTokens, ApiResponse

### Community 39 - "Authentication Pages"
Cohesion: 0.17
Nodes (9): ResetPasswordPageProps, AuthOSShell(), AuthOSShellProps, AuthSecurityBadge(), AuthStateCard(), AuthTextLink(), BackToLoginLink(), ResetPasswordForm() (+1 more)

### Community 40 - "Google Authentication"
Cohesion: 0.18
Nodes (12): GoogleCredentialResponse, GoogleLoginButton(), GoogleLoginButtonProps, isMockMode(), Window, LoginForm(), authErrorMessages, mapAuthError() (+4 more)

### Community 41 - "Online Food Search"
Cohesion: 0.18
Nodes (16): searchFoodItems(), searchFoodOnline(), tryBackendOnlineSearchProxy(), useCreateCustomFoodItem(), useFoodOnlineSearch(), useFoodSearch(), CreateCustomFoodDialog(), CreateCustomFoodDialogProps (+8 more)

### Community 42 - "UX Baseline Screenshots"
Cohesion: 0.14
Nodes (16): AppRole, captureMemberProgressDialog(), CaptureRecord, captureRoute(), captures, dashboardPatterns, desktopViewport, loginAs() (+8 more)

### Community 43 - "Staff Search Payments"
Cohesion: 0.18
Nodes (10): ManualPaymentPanel(), ManualPaymentPanelProps, initials(), MemberPreview(), MemberSearchPanel(), PaymentRequiredBanner(), StaffFrontDeskMemberSummary, mapStaffOperationError() (+2 more)

### Community 44 - "Member 360 Queries"
Cohesion: 0.23
Nodes (6): useAuthSessionStore, useAccessToken(), useMember360Data(), AdminMember360Page(), MemberSelfProfilePage(), PtMember360Page()

### Community 45 - "Role Profile Pages"
Cohesion: 0.19
Nodes (7): AdminProfilePage(), PtProfilePage(), StaffProfilePage(), WorkspaceShell(), AccountProfileWorkspace(), sessions, setSession()

### Community 46 - "Permission Guard States"
Cohesion: 0.17
Nodes (8): PermissionDenied(), PermissionDeniedProps, WorkspaceShellMetric, GuardStatus, PermissionGuard(), PermissionGuardProps, isAuthSessionExpired(), StaffPageFrameProps

### Community 47 - "External Nutrition API"
Cohesion: 0.22
Nodes (14): ExternalNutritionFood, findNutrient(), NutritionSearchOptions, roundMacro(), searchNutritionFoods(), searchOpenFoodFacts(), searchUsdaFoodDataCentral(), titleCase() (+6 more)

### Community 48 - "Member Training Views"
Cohesion: 0.17
Nodes (6): formatShortDate(), MemberTrainerNotesWorkspace(), MemberWorkoutWorkspace(), TrainerNoteListHeader(), WorkoutPlanList(), WorkoutPlanListHeader()

### Community 49 - "Page Motion Feedback"
Cohesion: 0.22
Nodes (9): RouteProgressBar(), PageAnimateWrapper(), PageAnimateWrapperProps, WorkspaceShellProps, ShortcutsHelpOverlay(), SpotlightSearch(), useKeyboardShortcuts(), ShortcutsState (+1 more)

### Community 50 - "Mock Service Worker"
Cohesion: 0.20
Nodes (11): worker, checkins, memberships, authHandlers, checkinHandlers, handlers, addNotification(), defaultNotifications (+3 more)

### Community 51 - "Training Mock Handlers"
Cohesion: 0.14
Nodes (6): assignments, trainerNotes, trainers, workoutPlans, member360Handlers, trainingHandlers

### Community 52 - "Staff Check In"
Cohesion: 0.18
Nodes (8): checkInInitials(), CheckInTerminal(), formatCheckInTime(), StaffPageFrame(), BlockedHint(), CheckInResultPanel(), CheckInInput, checkInSchema

### Community 53 - "User Avatar Components"
Cohesion: 0.21
Nodes (10): getInitials(), sizeClassNames, UserAvatar(), UserAvatarProps, UserAvatarSize, Avatar(), AvatarFallback(), AvatarImage() (+2 more)

### Community 54 - "Role Navigation Helpers"
Cohesion: 0.29
Nodes (6): ChangePasswordForm(), CurrentDashboardLink(), dashboardByRole, getDashboardRoute(), normalizeRoleRedirect(), userRoles

### Community 56 - "Person Form Validation"
Cohesion: 0.20
Nodes (8): DateOfBirthField, DateOfBirthFieldProps, GENDER_OPTIONS, GENDER_VALUES, genderLabel(), genderLabels, GenderValue, PERSON_LIMITS

### Community 57 - "Member 360 API"
Cohesion: 0.33
Nodes (8): authHeaders(), getMember360Data(), normalizeMembership(), normMembershipStatus(), normPaymentStatus(), RawMember360Data, Member360Data, Member360Membership

### Community 58 - "Member Hero Component"
Cohesion: 0.29
Nodes (7): ageLabel(), genderLabel(), Member360Hero(), Member360HeroProps, toStatusPillStatus(), ViewContext, viewContextLabels

### Community 59 - "VNPay Membership Flow"
Cohesion: 0.28
Nodes (7): VnPayReturnPage(), billingKeys, createVnpayUrl(), getVnpayReturnStatus(), VnPayCreateResult, VnPayReturnStatus, member360Keys

### Community 60 - "Management Edit Dialogs"
Cohesion: 0.28
Nodes (9): useUpdateManagedMember(), useUpdateManagedTrainer(), useUpdateManagedUser(), MemberEditDialog(), StaffEditDialog(), toDateInputValue(), TrainerAccountDialog(), TrainerEditDialog() (+1 more)

### Community 61 - "Nutrition Mock Handlers"
Cohesion: 0.25
Nodes (6): foodItems, mealLogs, externalFoodProduct(), mockCalorieTarget, mockOnlineFoodResults(), nutritionHandlers

### Community 62 - "Nutrition Test Server"
Cohesion: 0.39
Nodes (4): server, ok(), mockSummary(), MockTarget

### Community 63 - "Social Feed Builders"
Cohesion: 0.29
Nodes (6): buildSocialFeed(), formatDateTime(), MemberSocialProfile(), sortByDate(), sortWorkouts(), profileData

### Community 65 - "Membership Renewal Logic"
Cohesion: 0.40
Nodes (4): addDays(), getRenewalBaseDate(), isCurrentMembershipActive(), RenewPackageWizard()

### Community 66 - "Workout Rest Timer"
Cohesion: 0.47
Nodes (3): RestTimerOverlay(), RestTimerState, useRestTimerStore

### Community 67 - "Nutrition Asset Mapping"
Cohesion: 0.40
Nodes (5): defaultNutritionAsset, getNutritionAssetForFood(), normalizeFoodName(), NutritionAsset, nutritionAssetByFoodName

### Community 68 - "Mobile UX Tests"
Cohesion: 0.40
Nodes (4): loginAsMember(), memberRoutes, mobileViewport, waitForMsw()

### Community 69 - "Progress Mock Handlers"
Cohesion: 0.40
Nodes (3): progressEntries, progressHandlers, created()

### Community 70 - "Billing E2E Flow"
Cohesion: 0.80
Nodes (4): loginAsAdmin(), loginAsMember(), openLogin(), submitLogin()

### Community 71 - "Progress E2E Flow"
Cohesion: 0.80
Nodes (4): loginAsMember(), loginAsPT(), openLogin(), submitLogin()

### Community 73 - "Admin E2E Flow"
Cohesion: 0.83
Nodes (3): loginAsAdmin(), openLogin(), submitLogin()

### Community 75 - "Client Upgrade Tests"
Cohesion: 0.83
Nodes (3): loginAsMember(), openLogin(), submitLogin()

### Community 76 - "Nutrition E2E Flow"
Cohesion: 0.83
Nodes (3): loginAsMember(), openLogin(), submitLogin()

### Community 77 - "Food Search E2E"
Cohesion: 0.83
Nodes (3): loginAsMember(), openLogin(), submitLogin()

### Community 78 - "PT E2E Flow"
Cohesion: 0.83
Nodes (3): loginAsPT(), openLogin(), submitLogin()

### Community 79 - "Staff E2E Flow"
Cohesion: 0.83
Nodes (3): loginAsStaff(), openLogin(), submitLogin()

## Knowledge Gaps
- **299 isolated node(s):** `DEMO_ACCOUNTS`, `WORKSPACE_CARDS`, `INNOVATIONS`, `TECH_STACK`, `ACCENT` (+294 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Dropdown Tabs Controls` to `Staff Billing Payments`, `Notifications And Insights`, `Account Profile APIs`, `Admin Dashboard Analytics`, `Public Navigation Experience`, `Admin Workspace Routes`, `Workout Form Controls`, `PT Dashboard Workspace`, `Status And Select Controls`, `Dialog Action Components`, `PT Assignment Workflow`, `Member Management Mutations`, `Role Aware Member 360`, `Package Sales Wizards`, `Nutrition Sheet Forms`, `Calorie Summary Workspace`, `App Root Providers`, `Member 360 Timeline`, `Exercise Library UI`, `Food Scanning API`, `Member Social Profile`, `Meal Logging API`, `Profile Feedback States`, `Management Form Components`, `Authentication Pages`, `Online Food Search`, `Role Profile Pages`, `Page Motion Feedback`, `Staff Check In`, `User Avatar Components`, `Member Hero Component`, `Social Feed Builders`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `apiRequest()` connect `Member Management API` to `Staff Billing Payments`, `Notifications And Insights`, `Account Profile APIs`, `Admin Dashboard Analytics`, `HTTP Error Handling`, `PT Dashboard Workspace`, `Online Food Search`, `PT Assignment Workflow`, `Staff Front Desk Models`, `Authentication Session API`, `Staff Operations API`, `Progress Tracking`, `Member 360 API`, `Food Scanning API`, `VNPay Membership Flow`, `Password Recovery Forms`, `PT Training API`, `Meal Logging API`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `useAuthSessionStore` connect `Member 360 Queries` to `Staff Billing Payments`, `Notifications And Insights`, `Account Profile APIs`, `Admin Dashboard Analytics`, `Public Navigation Experience`, `PT Dashboard Workspace`, `Dialog Action Components`, `PT Assignment Workflow`, `Member Management API`, `Member Management Mutations`, `Authentication Session API`, `Staff Operations API`, `App Root Providers`, `Progress Tracking`, `Food Scanning API`, `Password Recovery Forms`, `PT Training API`, `Meal Logging API`, `Test Session Utilities`, `Authentication Pages`, `Google Authentication`, `Online Food Search`, `Role Profile Pages`, `Permission Guard States`, `Page Motion Feedback`, `Role Navigation Helpers`, `Member Protected Routes`, `Nutrition Component Tests`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `DEMO_ACCOUNTS`, `WORKSPACE_CARDS`, `INNOVATIONS` to the rest of the system?**
  _299 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Staff Billing Payments` be split into smaller, more focused modules?**
  _Cohesion score 0.05364314400458979 - nodes in this community are weakly interconnected._
- **Should `Notifications And Insights` be split into smaller, more focused modules?**
  _Cohesion score 0.05299608551641072 - nodes in this community are weakly interconnected._
- **Should `Account Profile APIs` be split into smaller, more focused modules?**
  _Cohesion score 0.058385093167701865 - nodes in this community are weakly interconnected._