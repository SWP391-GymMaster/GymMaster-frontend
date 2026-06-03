export type WorkoutAsset = {
  src: string
  title: string
  category: "strength" | "hypertrophy" | "conditioning" | "mobility" | "core"
}

const workoutAssetByExerciseName: Record<string, WorkoutAsset> = {
  squat: { src: "/assets/gymmaster/workouts/back-squat.png", title: "Squat", category: "strength" },
  "back squat": { src: "/assets/gymmaster/workouts/back-squat.png", title: "Back Squat", category: "strength" },
  "front squat": { src: "/assets/gymmaster/workouts/front-squat.png", title: "Front Squat", category: "strength" },
  "goblet squat": { src: "/assets/gymmaster/workouts/back-squat.png", title: "Goblet Squat", category: "hypertrophy" },

  "bench press": { src: "/assets/gymmaster/workouts/bench-press.png", title: "Bench Press", category: "strength" },
  "incline dumbbell press": { src: "/assets/gymmaster/workouts/incline-dumbbell-press.png", title: "Incline Dumbbell Press", category: "hypertrophy" },
  "dumbbell floor press": { src: "/assets/gymmaster/workouts/bench-press.png", title: "Dumbbell Floor Press", category: "hypertrophy" },
  "push-up": { src: "/assets/gymmaster/workouts/bench-press.png", title: "Push-up", category: "hypertrophy" },

  deadlift: { src: "/assets/gymmaster/workouts/deadlift.png", title: "Deadlift", category: "strength" },
  "romanian deadlift": { src: "/assets/gymmaster/workouts/romanian-deadlift.png", title: "Romanian Deadlift", category: "hypertrophy" },

  "lat pulldown": { src: "/assets/gymmaster/workouts/lat-pulldown.png", title: "Lat Pulldown", category: "hypertrophy" },
  "pull-up": { src: "/assets/gymmaster/workouts/lat-pulldown.png", title: "Pull-up", category: "strength" },
  "seated cable row": { src: "/assets/gymmaster/workouts/seated-cable-row.png", title: "Seated Cable Row", category: "hypertrophy" },
  "dumbbell row": { src: "/assets/gymmaster/workouts/seated-cable-row.png", title: "Dumbbell Row", category: "hypertrophy" },

  "overhead press": { src: "/assets/gymmaster/workouts/overhead-press.png", title: "Overhead Press", category: "strength" },
  "dumbbell shoulder press": { src: "/assets/gymmaster/workouts/overhead-press.png", title: "Dumbbell Shoulder Press", category: "hypertrophy" },

  "reverse lunge": { src: "/assets/gymmaster/workouts/dumbbell-lunge.png", title: "Reverse Lunge", category: "hypertrophy" },
  "dumbbell lunge": { src: "/assets/gymmaster/workouts/dumbbell-lunge.png", title: "Dumbbell Lunge", category: "hypertrophy" },

  plank: { src: "/assets/gymmaster/workouts/plank.png", title: "Plank", category: "core" },
  "side plank": { src: "/assets/gymmaster/workouts/side-plank.png", title: "Side Plank", category: "core" },

  "interval run": { src: "/assets/gymmaster/workouts/interval-run.png", title: "Interval Run", category: "conditioning" },
  jogging: { src: "/assets/gymmaster/workouts/treadmill-run.png", title: "Jogging", category: "conditioning" },
  "brisk walk": { src: "/assets/gymmaster/workouts/treadmill-run.png", title: "Brisk Walk", category: "conditioning" },

  "biceps curl": { src: "/assets/gymmaster/workouts/dumbbell-curl.png", title: "Biceps Curl", category: "hypertrophy" },
  "dumbbell curl": { src: "/assets/gymmaster/workouts/dumbbell-curl.png", title: "Dumbbell Curl", category: "hypertrophy" },
}

export const defaultWorkoutAsset: WorkoutAsset = {
  src: "/assets/gymmaster/workouts/back-squat.png",
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
