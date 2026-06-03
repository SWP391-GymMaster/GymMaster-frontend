export type WorkoutAsset = {
  src: string
  title: string
  category: "strength" | "hypertrophy" | "conditioning" | "mobility" | "core"
}

const workoutAssetByExerciseName: Record<string, WorkoutAsset> = {
  squat: {
    src: "/assets/workouts/back-squat.png",
    title: "Squat",
    category: "strength",
  },
  "back squat": {
    src: "/assets/workouts/back-squat.png",
    title: "Back Squat",
    category: "strength",
  },
  "bench press": {
    src: "/assets/workouts/bench-press.png",
    title: "Bench Press",
    category: "strength",
  },
  deadlift: {
    src: "/assets/workouts/deadlift.png",
    title: "Deadlift",
    category: "strength",
  },
  "romanian deadlift": {
    src: "/assets/workouts/deadlift.png",
    title: "Romanian Deadlift",
    category: "hypertrophy",
  },
  "lat pulldown": {
    src: "/assets/workouts/lat-pulldown.png",
    title: "Lat Pulldown",
    category: "hypertrophy",
  },
  "seated cable row": {
    src: "/assets/workouts/seated-cable-row.png",
    title: "Seated Cable Row",
    category: "hypertrophy",
  },
  "overhead press": {
    src: "/assets/workouts/overhead-press.png",
    title: "Overhead Press",
    category: "strength",
  },
  "dumbbell shoulder press": {
    src: "/assets/workouts/overhead-press.png",
    title: "Dumbbell Shoulder Press",
    category: "hypertrophy",
  },
  "reverse lunge": {
    src: "/assets/workouts/dumbbell-lunge.png",
    title: "Reverse Lunge",
    category: "hypertrophy",
  },
  "dumbbell lunge": {
    src: "/assets/workouts/dumbbell-lunge.png",
    title: "Dumbbell Lunge",
    category: "hypertrophy",
  },
  plank: {
    src: "/assets/workouts/plank.png",
    title: "Plank",
    category: "core",
  },
  "side plank": {
    src: "/assets/workouts/plank.png",
    title: "Side Plank",
    category: "core",
  },
  "interval run": {
    src: "/assets/workouts/treadmill-run.png",
    title: "Interval Run",
    category: "conditioning",
  },
  jogging: {
    src: "/assets/workouts/treadmill-run.png",
    title: "Jogging",
    category: "conditioning",
  },
  "biceps curl": {
    src: "/assets/workouts/dumbbell-curl.png",
    title: "Biceps Curl",
    category: "hypertrophy",
  },
  "dumbbell curl": {
    src: "/assets/workouts/dumbbell-curl.png",
    title: "Dumbbell Curl",
    category: "hypertrophy",
  },
}

export const defaultWorkoutAsset: WorkoutAsset = {
  src: "/assets/workouts/back-squat.png",
  title: "Workout",
  category: "strength",
}

function normalizeExerciseName(value: string) {
  return value.trim().toLowerCase()
}

export function getWorkoutAssetForExercise(name: string) {
  const normalizedName = normalizeExerciseName(name)

  if (workoutAssetByExerciseName[normalizedName]) {
    return workoutAssetByExerciseName[normalizedName]
  }

  const partialMatch = Object.entries(workoutAssetByExerciseName).find(([key]) =>
    normalizedName.includes(key),
  )

  return partialMatch?.[1] ?? defaultWorkoutAsset
}

export function getWorkoutCategoryLabel(category: WorkoutAsset["category"]) {
  switch (category) {
    case "strength":
      return "Sức mạnh"
    case "hypertrophy":
      return "Tăng cơ"
    case "conditioning":
      return "Thể lực"
    case "mobility":
      return "Mobility"
    case "core":
      return "Core"
  }
}
