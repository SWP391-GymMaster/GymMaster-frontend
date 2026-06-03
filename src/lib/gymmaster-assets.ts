export const gymMasterAssets = {
  brand: {
    mark: "/assets/gymmaster/gymmaster-mark.svg",
    wordmark: "/assets/gymmaster/gymmaster-wordmark.svg",
  },
  covers: {
    operations: "/assets/gymmaster/gym-operations-cover.webp",
    workout: "/assets/gymmaster/workout-equipment-cover.webp",
    nutrition: "/assets/gymmaster/nutrition-cover.webp",
  },

  // Backward-compatible aliases for components that still import these keys.
  operationsCover: "/assets/gymmaster/gym-operations-cover.webp",
  workoutCover: "/assets/gymmaster/workout-equipment-cover.webp",
  nutritionCover: "/assets/gymmaster/nutrition-cover.webp",

  // Keep optional page-level aliases pointing to the canonical covers.
  backgrounds: {
    welcomeGymHero: "/assets/gymmaster/gym-operations-cover.webp",
    authPremiumDark: "/assets/gymmaster/gym-operations-cover.webp",
    adminOperations: "/assets/gymmaster/gym-operations-cover.webp",
    staffFrontdesk: "/assets/gymmaster/gym-operations-cover.webp",
    ptCoachHub: "/assets/gymmaster/workout-equipment-cover.webp",
    memberToday: "/assets/gymmaster/workout-equipment-cover.webp",
    nutritionMeal: "/assets/gymmaster/nutrition-cover.webp",
    calorieSummary: "/assets/gymmaster/nutrition-cover.webp",
  },

  notes: [
    "Raster covers were generated for this frontend repo and contain no embedded text or logos.",
    "Logo assets are deterministic SVGs and should remain the canonical runtime brand marks.",
  ],
} as const

export type GymMasterAssets = typeof gymMasterAssets
