export const gymMasterAssets = {
  brand: {
    mark: "/assets/gymmaster/gymmaster-mark.svg",
    wordmark: "/assets/gymmaster/gymmaster-wordmark.svg",
  },
  covers: {
    operations: "/assets/gymmaster/covers/gym-operations-cover.png",
    workout: "/assets/gymmaster/workout-equipment-cover.webp",
    nutrition: "/assets/gymmaster/covers/nutrition-cover.png",
  },

  // Backward-compatible aliases for components that still import these keys.
  operationsCover: "/assets/gymmaster/covers/gym-operations-cover.png",
  workoutCover: "/assets/gymmaster/workout-equipment-cover.webp",
  nutritionCover: "/assets/gymmaster/covers/nutrition-cover.png",

  // Keep optional page-level aliases pointing to the canonical covers.
  backgrounds: {
    welcomeGymHero: "/assets/gymmaster/covers/welcome-hero-cover.png",
    authPremiumDark: "/assets/gymmaster/covers/welcome-hero-cover.png",
    adminOperations: "/assets/gymmaster/covers/admin-operations-cover.png",
    staffFrontdesk: "/assets/gymmaster/covers/staff-frontdesk-cover.png",
    ptCoachHub: "/assets/gymmaster/covers/pt-coach-cover.png",
    memberToday: "/assets/gymmaster/covers/member-today-cover.png",
    nutritionMeal: "/assets/gymmaster/covers/nutrition-meal-cover.png",
    calorieSummary: "/assets/gymmaster/covers/calorie-summary-cover.png",
  },

  notes: [
    "Raster covers were generated for this frontend repo and contain no embedded text or logos.",
    "Logo assets are deterministic SVGs and should remain the canonical runtime brand marks.",
  ],
} as const

export type GymMasterAssets = typeof gymMasterAssets
