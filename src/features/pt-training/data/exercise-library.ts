export type TrainingEnvironment =
  | "gym"
  | "home_equipment"
  | "home_no_equipment"
  | "outdoor"
  | "mobility_rehab"

export type TrainingGoal =
  | "strength"
  | "hypertrophy"
  | "fat_loss"
  | "endurance"
  | "mobility"
  | "beginner"
  | "weight_loss"
  | "rehab"

export type TrainingSplit =
  | "full_body"
  | "upper_lower"
  | "ppl"
  | "arnold"

export type ExerciseCategory =
  | "Full Body"
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs"
  | "Glutes"
  | "Core"
  | "Cardio"
  | "Mobility"
  | "Rehab"

export type ExerciseLevel = "beginner" | "intermediate" | "advanced"

export type ExerciseOption = {
  id: string
  name: string
  category: ExerciseCategory
  muscleGroups: string[]
  environments: TrainingEnvironment[]
  equipment: string[]
  level: ExerciseLevel
  goals: TrainingGoal[]
  defaultSets: number
  defaultReps: string
  defaultNote: string
}

export type WorkoutPresetExercise = {
  exerciseId: string
  sets?: number
  reps?: string
  note?: string
}

export type WorkoutPreset = {
  id: string
  name: string
  split: TrainingSplit
  daysPerWeek: number
  environment: TrainingEnvironment
  goal: TrainingGoal
  description: string
  exercises: WorkoutPresetExercise[]
}

export const trainingEnvironmentOptions: {
  value: TrainingEnvironment
  label: string
  description: string
}[] = [
  {
    value: "gym",
    label: "Gym",
    description: "Máy tập, barbell, dumbbell, cable, bench.",
  },
  {
    value: "home_equipment",
    label: "Home + equipment",
    description: "Dumbbell, kettlebell, resistance band hoặc pull-up bar.",
  },
  {
    value: "home_no_equipment",
    label: "Home no equipment",
    description: "Bodyweight, core, conditioning và mobility.",
  },
  {
    value: "outdoor",
    label: "Outdoor",
    description: "Chạy bộ, interval, conditioning ngoài trời.",
  },
  {
    value: "mobility_rehab",
    label: "Mobility / Rehab",
    description: "Phục hồi, ổn định khớp và kỹ thuật kiểm soát.",
  },
]

export const trainingGoalOptions: {
  value: TrainingGoal
  label: string
}[] = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "fat_loss", label: "Fat Loss" },
  { value: "endurance", label: "Endurance" },
  { value: "mobility", label: "Mobility" },
  { value: "beginner", label: "Beginner Foundation" },
]

export const trainingSplitOptions: {
  value: TrainingSplit
  label: string
}[] = [
  { value: "full_body", label: "Full Body" },
  { value: "upper_lower", label: "Upper / Lower" },
  { value: "ppl", label: "PPL" },
  { value: "arnold", label: "Arnold Split" },
]

export const trainingDaysPerWeekOptions = [2, 3, 4, 5, 6] as const

export const exerciseLibrary: ExerciseOption[] = [
  {
    id: "back-squat",
    name: "Back Squat",
    category: "Legs",
    muscleGroups: ["Quads", "Glutes", "Core"],
    environments: ["gym"],
    equipment: ["barbell", "rack"],
    level: "intermediate",
    goals: ["strength", "hypertrophy"],
    defaultSets: 4,
    defaultReps: "5-8",
    defaultNote: "Giữ thân người chắc, brace core trước khi xuống.",
  },
  {
    id: "front-squat",
    name: "Front Squat",
    category: "Legs",
    muscleGroups: ["Quads", "Core", "Upper Back"],
    environments: ["gym"],
    equipment: ["barbell", "rack"],
    level: "intermediate",
    goals: ["strength", "hypertrophy"],
    defaultSets: 4,
    defaultReps: "5-8",
    defaultNote: "Giữ khuỷu cao, thân người thẳng, kiểm soát eccentric.",
  },
  {
    id: "bench-press",
    name: "Bench Press",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Front Delts"],
    environments: ["gym"],
    equipment: ["barbell", "bench"],
    level: "intermediate",
    goals: ["strength", "hypertrophy"],
    defaultSets: 4,
    defaultReps: "5-8",
    defaultNote: "Kéo bả vai về sau, chạm ngực có kiểm soát.",
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    category: "Chest",
    muscleGroups: ["Upper Chest", "Triceps", "Front Delts"],
    environments: ["gym", "home_equipment"],
    equipment: ["dumbbell", "bench"],
    level: "intermediate",
    goals: ["hypertrophy", "strength"],
    defaultSets: 3,
    defaultReps: "8-12",
    defaultNote: "Giữ cổ tay thẳng, không bật vai lên khi đẩy.",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    category: "Full Body",
    muscleGroups: ["Posterior Chain", "Back", "Glutes"],
    environments: ["gym"],
    equipment: ["barbell"],
    level: "advanced",
    goals: ["strength"],
    defaultSets: 3,
    defaultReps: "3-5",
    defaultNote: "Bar gần ống chân, lưng trung lập, kéo bằng chân và hông.",
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    category: "Glutes",
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    environments: ["gym", "home_equipment"],
    equipment: ["barbell", "dumbbell"],
    level: "intermediate",
    goals: ["hypertrophy", "strength"],
    defaultSets: 3,
    defaultReps: "8-10",
    defaultNote: "Đẩy hông ra sau, giữ lưng trung lập, kéo căng hamstring.",
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    category: "Back",
    muscleGroups: ["Lats", "Biceps", "Upper Back"],
    environments: ["gym"],
    equipment: ["cable machine"],
    level: "beginner",
    goals: ["hypertrophy", "beginner"],
    defaultSets: 3,
    defaultReps: "10-12",
    defaultNote: "Kéo khuỷu xuống hai bên thân, không ngả người quá nhiều.",
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row",
    category: "Back",
    muscleGroups: ["Mid Back", "Lats", "Biceps"],
    environments: ["gym"],
    equipment: ["cable machine"],
    level: "beginner",
    goals: ["hypertrophy", "beginner"],
    defaultSets: 3,
    defaultReps: "10-12",
    defaultNote: "Kéo về bụng dưới, giữ ngực mở và vai thấp.",
  },
  {
    id: "pull-up",
    name: "Pull-up",
    category: "Back",
    muscleGroups: ["Lats", "Biceps", "Core"],
    environments: ["gym", "home_equipment", "outdoor"],
    equipment: ["pull-up bar"],
    level: "advanced",
    goals: ["strength", "hypertrophy"],
    defaultSets: 4,
    defaultReps: "6-10",
    defaultNote: "Siết core, kéo ngực hướng lên thanh, xuống có kiểm soát.",
  },
  {
    id: "dumbbell-row",
    name: "Dumbbell Row",
    category: "Back",
    muscleGroups: ["Lats", "Mid Back", "Biceps"],
    environments: ["gym", "home_equipment"],
    equipment: ["dumbbell", "bench"],
    level: "beginner",
    goals: ["hypertrophy", "beginner"],
    defaultSets: 3,
    defaultReps: "10-12 mỗi bên",
    defaultNote: "Kéo khuỷu về hông, tránh xoay thân quá nhiều.",
  },
  {
    id: "overhead-press",
    name: "Overhead Press",
    category: "Shoulders",
    muscleGroups: ["Shoulders", "Triceps", "Core"],
    environments: ["gym", "home_equipment"],
    equipment: ["barbell", "dumbbell"],
    level: "intermediate",
    goals: ["strength", "hypertrophy"],
    defaultSets: 4,
    defaultReps: "6-8",
    defaultNote: "Siết mông và core, đẩy thẳng lên trên đầu.",
  },
  {
    id: "dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    category: "Shoulders",
    muscleGroups: ["Side Delts"],
    environments: ["gym", "home_equipment"],
    equipment: ["dumbbell"],
    level: "beginner",
    goals: ["hypertrophy"],
    defaultSets: 3,
    defaultReps: "12-15",
    defaultNote: "Nâng đến ngang vai, giữ khuỷu hơi cong, không đung đưa.",
  },
  {
    id: "face-pull",
    name: "Face Pull",
    category: "Shoulders",
    muscleGroups: ["Rear Delts", "Upper Back", "Rotator Cuff"],
    environments: ["gym", "home_equipment"],
    equipment: ["cable", "resistance band"],
    level: "beginner",
    goals: ["hypertrophy", "mobility", "beginner"],
    defaultSets: 3,
    defaultReps: "12-15",
    defaultNote: "Kéo dây về ngang mặt, xoay ngoài vai ở cuối chuyển động.",
  },
  {
    id: "leg-press",
    name: "Leg Press",
    category: "Legs",
    muscleGroups: ["Quads", "Glutes"],
    environments: ["gym"],
    equipment: ["leg press machine"],
    level: "beginner",
    goals: ["hypertrophy", "beginner"],
    defaultSets: 4,
    defaultReps: "10-12",
    defaultNote: "Không khóa gối hoàn toàn, hạ sâu trong tầm kiểm soát.",
  },
  {
    id: "leg-curl",
    name: "Leg Curl",
    category: "Legs",
    muscleGroups: ["Hamstrings"],
    environments: ["gym"],
    equipment: ["leg curl machine"],
    level: "beginner",
    goals: ["hypertrophy", "beginner"],
    defaultSets: 3,
    defaultReps: "10-15",
    defaultNote: "Siết hamstring ở cuối biên độ, không bật tạ.",
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    category: "Legs",
    muscleGroups: ["Quads"],
    environments: ["gym"],
    equipment: ["leg extension machine"],
    level: "beginner",
    goals: ["hypertrophy", "beginner"],
    defaultSets: 3,
    defaultReps: "12-15",
    defaultNote: "Giữ 1 giây ở đỉnh, hạ chậm và kiểm soát.",
  },
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    category: "Glutes",
    muscleGroups: ["Glutes", "Hamstrings"],
    environments: ["gym", "home_equipment"],
    equipment: ["barbell", "dumbbell", "bench"],
    level: "intermediate",
    goals: ["hypertrophy", "strength"],
    defaultSets: 4,
    defaultReps: "8-12",
    defaultNote: "Cằm hơi thu, xương sườn hạ, siết mông ở đỉnh.",
  },
  {
    id: "cable-triceps-pushdown",
    name: "Cable Triceps Pushdown",
    category: "Arms",
    muscleGroups: ["Triceps"],
    environments: ["gym"],
    equipment: ["cable machine"],
    level: "beginner",
    goals: ["hypertrophy"],
    defaultSets: 3,
    defaultReps: "10-15",
    defaultNote: "Giữ khuỷu cố định sát thân, duỗi hết biên độ.",
  },
  {
    id: "biceps-curl",
    name: "Biceps Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    environments: ["gym", "home_equipment"],
    equipment: ["dumbbell", "barbell", "band"],
    level: "beginner",
    goals: ["hypertrophy"],
    defaultSets: 3,
    defaultReps: "10-12",
    defaultNote: "Không đung đưa thân, kiểm soát pha hạ tạ.",
  },
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    category: "Legs",
    muscleGroups: ["Quads", "Glutes", "Core"],
    environments: ["gym", "home_equipment"],
    equipment: ["dumbbell", "kettlebell"],
    level: "beginner",
    goals: ["beginner", "hypertrophy", "fat_loss"],
    defaultSets: 3,
    defaultReps: "10-12",
    defaultNote: "Giữ tạ sát ngực, gối đi theo hướng mũi chân.",
  },
  {
    id: "dumbbell-floor-press",
    name: "Dumbbell Floor Press",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps"],
    environments: ["home_equipment"],
    equipment: ["dumbbell"],
    level: "beginner",
    goals: ["beginner", "hypertrophy"],
    defaultSets: 3,
    defaultReps: "8-12",
    defaultNote: "Chạm nhẹ khuỷu xuống sàn, giữ cổ tay thẳng.",
  },
  {
    id: "band-row",
    name: "Resistance Band Row",
    category: "Back",
    muscleGroups: ["Back", "Biceps"],
    environments: ["home_equipment", "mobility_rehab"],
    equipment: ["resistance band"],
    level: "beginner",
    goals: ["beginner", "mobility", "hypertrophy"],
    defaultSets: 3,
    defaultReps: "12-15",
    defaultNote: "Kéo bả vai về sau, giữ vai thấp.",
  },
  {
    id: "kettlebell-swing",
    name: "Kettlebell Swing",
    category: "Full Body",
    muscleGroups: ["Glutes", "Hamstrings", "Core"],
    environments: ["home_equipment", "gym"],
    equipment: ["kettlebell"],
    level: "intermediate",
    goals: ["fat_loss", "endurance"],
    defaultSets: 4,
    defaultReps: "15-20",
    defaultNote: "Đẩy hông mạnh, không nâng bằng tay, giữ cột sống trung lập.",
  },
  {
    id: "farmer-carry",
    name: "Farmer Carry",
    category: "Full Body",
    muscleGroups: ["Grip", "Core", "Traps"],
    environments: ["gym", "home_equipment", "outdoor"],
    equipment: ["dumbbell", "kettlebell"],
    level: "beginner",
    goals: ["strength", "endurance", "fat_loss"],
    defaultSets: 4,
    defaultReps: "30-40m",
    defaultNote: "Đi thẳng, vai thấp, thân người không nghiêng.",
  },
  {
    id: "bodyweight-squat",
    name: "Bodyweight Squat",
    category: "Legs",
    muscleGroups: ["Quads", "Glutes"],
    environments: ["home_no_equipment", "outdoor", "mobility_rehab"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["beginner", "fat_loss", "endurance"],
    defaultSets: 3,
    defaultReps: "12-15",
    defaultNote: "Đẩy gối theo hướng mũi chân, xuống trong tầm kiểm soát.",
  },
  {
    id: "reverse-lunge",
    name: "Reverse Lunge",
    category: "Legs",
    muscleGroups: ["Quads", "Glutes", "Balance"],
    environments: ["home_no_equipment", "home_equipment", "outdoor"],
    equipment: ["bodyweight", "dumbbell"],
    level: "beginner",
    goals: ["beginner", "fat_loss", "hypertrophy"],
    defaultSets: 3,
    defaultReps: "10 mỗi bên",
    defaultNote: "Bước lùi có kiểm soát, giữ thân người thẳng.",
  },
  {
    id: "push-up",
    name: "Push-up",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Core"],
    environments: ["home_no_equipment", "outdoor", "gym"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["beginner", "hypertrophy", "fat_loss"],
    defaultSets: 3,
    defaultReps: "8-15",
    defaultNote: "Giữ thân người như một đường thẳng, khuỷu khoảng 45 độ.",
  },
  {
    id: "incline-push-up",
    name: "Incline Push-up",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Core"],
    environments: ["home_no_equipment", "outdoor", "gym"],
    equipment: ["bodyweight", "bench"],
    level: "beginner",
    goals: ["beginner", "fat_loss"],
    defaultSets: 3,
    defaultReps: "10-15",
    defaultNote: "Chọn độ cao phù hợp để giữ form ổn định.",
  },
  {
    id: "pike-push-up",
    name: "Pike Push-up",
    category: "Shoulders",
    muscleGroups: ["Shoulders", "Triceps"],
    environments: ["home_no_equipment", "outdoor"],
    equipment: ["bodyweight"],
    level: "intermediate",
    goals: ["hypertrophy", "strength"],
    defaultSets: 3,
    defaultReps: "6-10",
    defaultNote: "Hông cao, đầu đi xuống giữa hai tay.",
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    category: "Glutes",
    muscleGroups: ["Glutes", "Hamstrings"],
    environments: ["home_no_equipment", "home_equipment", "mobility_rehab"],
    equipment: ["bodyweight", "band"],
    level: "beginner",
    goals: ["beginner", "mobility", "rehab"],
    defaultSets: 3,
    defaultReps: "12-15",
    defaultNote: "Siết mông ở đỉnh, không ưỡn lưng quá mức.",
  },
  {
    id: "plank",
    name: "Plank",
    category: "Core",
    muscleGroups: ["Core", "Shoulders"],
    environments: ["gym", "home_no_equipment", "home_equipment", "outdoor"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["beginner", "fat_loss", "endurance"],
    defaultSets: 3,
    defaultReps: "30-45 giây",
    defaultNote: "Siết mông và core, không võng lưng.",
  },
  {
    id: "side-plank",
    name: "Side Plank",
    category: "Core",
    muscleGroups: ["Obliques", "Core"],
    environments: ["gym", "home_no_equipment", "home_equipment", "outdoor"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["beginner", "mobility", "endurance"],
    defaultSets: 3,
    defaultReps: "20-40 giây mỗi bên",
    defaultNote: "Giữ hông cao và thân người thẳng.",
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    category: "Core",
    muscleGroups: ["Core", "Hip Flexors"],
    environments: ["home_no_equipment", "mobility_rehab", "gym"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["beginner", "mobility", "rehab"],
    defaultSets: 3,
    defaultReps: "8-10 mỗi bên",
    defaultNote: "Ép lưng dưới xuống sàn, di chuyển chậm và kiểm soát.",
  },
  {
    id: "bird-dog",
    name: "Bird Dog",
    category: "Core",
    muscleGroups: ["Core", "Glutes", "Back"],
    environments: ["home_no_equipment", "mobility_rehab", "gym"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["beginner", "mobility", "rehab"],
    defaultSets: 3,
    defaultReps: "8-10 mỗi bên",
    defaultNote: "Giữ hông không xoay, vươn tay và chân đối bên.",
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    category: "Cardio",
    muscleGroups: ["Core", "Hip Flexors", "Shoulders"],
    environments: ["home_no_equipment", "outdoor", "gym"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["fat_loss", "endurance"],
    defaultSets: 4,
    defaultReps: "30 giây",
    defaultNote: "Giữ vai trên cổ tay, kéo gối nhanh nhưng không võng lưng.",
  },
  {
    id: "burpee",
    name: "Burpee",
    category: "Cardio",
    muscleGroups: ["Full Body"],
    environments: ["home_no_equipment", "outdoor", "gym"],
    equipment: ["bodyweight"],
    level: "intermediate",
    goals: ["fat_loss", "endurance"],
    defaultSets: 4,
    defaultReps: "8-12",
    defaultNote: "Giữ nhịp ổn định, ưu tiên form trước tốc độ.",
  },
  {
    id: "jumping-jack",
    name: "Jumping Jack",
    category: "Cardio",
    muscleGroups: ["Full Body", "Calves"],
    environments: ["home_no_equipment", "outdoor", "gym"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["fat_loss", "endurance", "beginner"],
    defaultSets: 4,
    defaultReps: "30-45 giây",
    defaultNote: "Tiếp đất nhẹ, giữ nhịp thở đều.",
  },
  {
    id: "interval-run",
    name: "Interval Run",
    category: "Cardio",
    muscleGroups: ["Cardio", "Legs"],
    environments: ["outdoor", "gym"],
    equipment: ["treadmill", "outdoor track"],
    level: "intermediate",
    goals: ["fat_loss", "endurance"],
    defaultSets: 6,
    defaultReps: "30s nhanh / 90s chậm",
    defaultNote: "Khởi động kỹ, giữ tốc độ nhanh ở mức kiểm soát được.",
  },
  {
    id: "brisk-walk",
    name: "Brisk Walk",
    category: "Cardio",
    muscleGroups: ["Cardio"],
    environments: ["outdoor", "gym"],
    equipment: ["treadmill", "outdoor"],
    level: "beginner",
    goals: ["beginner", "fat_loss", "endurance"],
    defaultSets: 1,
    defaultReps: "20-40 phút",
    defaultNote: "Giữ nhịp đi nhanh nhưng vẫn nói được câu ngắn.",
  },
  {
    id: "cat-cow",
    name: "Cat Cow",
    category: "Mobility",
    muscleGroups: ["Spine", "Core"],
    environments: ["home_no_equipment", "mobility_rehab", "gym"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["mobility", "beginner"],
    defaultSets: 2,
    defaultReps: "8-10",
    defaultNote: "Di chuyển chậm theo hơi thở, không ép quá biên độ.",
  },
  {
    id: "worlds-greatest-stretch",
    name: "World's Greatest Stretch",
    category: "Mobility",
    muscleGroups: ["Hips", "T-Spine", "Hamstrings"],
    environments: ["home_no_equipment", "mobility_rehab", "gym", "outdoor"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["mobility", "beginner"],
    defaultSets: 2,
    defaultReps: "5 mỗi bên",
    defaultNote: "Giữ hông thấp, xoay ngực mở theo tay.",
  },
  {
    id: "hip-flexor-stretch",
    name: "Hip Flexor Stretch",
    category: "Mobility",
    muscleGroups: ["Hip Flexors", "Quads"],
    environments: ["home_no_equipment", "mobility_rehab", "gym"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["mobility", "rehab"],
    defaultSets: 2,
    defaultReps: "30 giây mỗi bên",
    defaultNote: "Siết mông bên sau để cảm nhận căng ở hông trước.",
  },
  {
    id: "thoracic-rotation",
    name: "Thoracic Rotation",
    category: "Mobility",
    muscleGroups: ["T-Spine", "Shoulders"],
    environments: ["home_no_equipment", "mobility_rehab", "gym"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["mobility", "rehab"],
    defaultSets: 2,
    defaultReps: "8 mỗi bên",
    defaultNote: "Xoay từ lưng trên, giữ hông ổn định.",
  },
  {
    id: "band-external-rotation",
    name: "Band External Rotation",
    category: "Rehab",
    muscleGroups: ["Rotator Cuff", "Rear Delts"],
    environments: ["home_equipment", "mobility_rehab", "gym"],
    equipment: ["resistance band"],
    level: "beginner",
    goals: ["mobility", "rehab", "beginner"],
    defaultSets: 3,
    defaultReps: "12-15 mỗi bên",
    defaultNote: "Giữ khuỷu sát thân, xoay ngoài vai chậm và kiểm soát.",
  },
  {
    id: "scapular-wall-slide",
    name: "Scapular Wall Slide",
    category: "Rehab",
    muscleGroups: ["Shoulders", "Upper Back"],
    environments: ["home_no_equipment", "mobility_rehab", "gym"],
    equipment: ["wall"],
    level: "beginner",
    goals: ["mobility", "rehab"],
    defaultSets: 2,
    defaultReps: "8-12",
    defaultNote: "Giữ xương sườn hạ, không ưỡn lưng khi trượt tay.",
  },
  {
    id: "ankle-mobility-drill",
    name: "Ankle Mobility Drill",
    category: "Mobility",
    muscleGroups: ["Ankles", "Calves"],
    environments: ["home_no_equipment", "mobility_rehab", "gym"],
    equipment: ["bodyweight"],
    level: "beginner",
    goals: ["mobility", "rehab"],
    defaultSets: 2,
    defaultReps: "10 mỗi bên",
    defaultNote: "Đẩy gối qua mũi chân nhưng giữ gót chạm sàn.",
  },
]

export const workoutPresets: WorkoutPreset[] = [
  {
    id: "full-body-2-gym-beginner",
    name: "Full Body Foundation · 2 buổi/tuần",
    split: "full_body",
    daysPerWeek: 2,
    environment: "gym",
    goal: "beginner",
    description: "Cơ bản, dễ kiểm soát, phù hợp học viên mới ở phòng gym.",
    exercises: [
      { exerciseId: "goblet-squat" },
      { exerciseId: "lat-pulldown" },
      { exerciseId: "dumbbell-floor-press" },
      { exerciseId: "romanian-deadlift" },
      { exerciseId: "plank" },
    ],
  },
  {
    id: "full-body-3-home-no-equipment-fat-loss",
    name: "Full Body Fat Loss · Home · 3 buổi/tuần",
    split: "full_body",
    daysPerWeek: 3,
    environment: "home_no_equipment",
    goal: "fat_loss",
    description: "Bodyweight circuit cho học viên tập tại nhà không dụng cụ.",
    exercises: [
      { exerciseId: "bodyweight-squat", sets: 4, reps: "15" },
      { exerciseId: "push-up", sets: 4, reps: "8-12" },
      { exerciseId: "reverse-lunge", sets: 3, reps: "12 mỗi bên" },
      { exerciseId: "mountain-climber", sets: 4, reps: "30 giây" },
      { exerciseId: "plank", sets: 3, reps: "45 giây" },
    ],
  },
  {
    id: "upper-lower-4-gym-hypertrophy",
    name: "Upper / Lower Hypertrophy · 4 buổi/tuần",
    split: "upper_lower",
    daysPerWeek: 4,
    environment: "gym",
    goal: "hypertrophy",
    description: "Mẫu buổi Upper đại diện, PT có thể duplicate cho Lower day.",
    exercises: [
      { exerciseId: "bench-press", sets: 4, reps: "6-8" },
      { exerciseId: "lat-pulldown", sets: 4, reps: "8-12" },
      { exerciseId: "incline-dumbbell-press", sets: 3, reps: "8-12" },
      { exerciseId: "seated-cable-row", sets: 3, reps: "10-12" },
      { exerciseId: "dumbbell-lateral-raise", sets: 3, reps: "12-15" },
      { exerciseId: "cable-triceps-pushdown", sets: 3, reps: "10-15" },
      { exerciseId: "biceps-curl", sets: 3, reps: "10-12" },
    ],
  },
  {
    id: "ppl-3-gym-strength",
    name: "PPL Strength Base · 3 buổi/tuần",
    split: "ppl",
    daysPerWeek: 3,
    environment: "gym",
    goal: "strength",
    description: "Mẫu Push day đại diện cho lịch PPL 3 buổi/tuần.",
    exercises: [
      { exerciseId: "bench-press", sets: 4, reps: "5-8" },
      { exerciseId: "overhead-press", sets: 4, reps: "6-8" },
      { exerciseId: "incline-dumbbell-press", sets: 3, reps: "8-10" },
      { exerciseId: "dumbbell-lateral-raise", sets: 3, reps: "12-15" },
      { exerciseId: "cable-triceps-pushdown", sets: 3, reps: "10-12" },
    ],
  },
  {
    id: "ppl-6-gym-hypertrophy",
    name: "PPL Hypertrophy · 6 buổi/tuần",
    split: "ppl",
    daysPerWeek: 6,
    environment: "gym",
    goal: "hypertrophy",
    description: "Mẫu Pull day volume cao cho lịch PPL 6 buổi/tuần.",
    exercises: [
      { exerciseId: "pull-up", sets: 4, reps: "6-10" },
      { exerciseId: "lat-pulldown", sets: 3, reps: "10-12" },
      { exerciseId: "seated-cable-row", sets: 4, reps: "8-12" },
      { exerciseId: "dumbbell-row", sets: 3, reps: "10-12 mỗi bên" },
      { exerciseId: "face-pull", sets: 3, reps: "12-15" },
      { exerciseId: "biceps-curl", sets: 4, reps: "10-12" },
    ],
  },
  {
    id: "arnold-6-gym-hypertrophy",
    name: "Arnold Split · 6 buổi/tuần",
    split: "arnold",
    daysPerWeek: 6,
    environment: "gym",
    goal: "hypertrophy",
    description: "Mẫu Chest/Back day theo Arnold split.",
    exercises: [
      { exerciseId: "bench-press", sets: 4, reps: "6-8" },
      { exerciseId: "pull-up", sets: 4, reps: "6-10" },
      { exerciseId: "incline-dumbbell-press", sets: 4, reps: "8-10" },
      { exerciseId: "seated-cable-row", sets: 4, reps: "8-12" },
      { exerciseId: "face-pull", sets: 3, reps: "12-15" },
    ],
  },
  {
    id: "arnold-3-home-equipment",
    name: "Arnold Split Lite · Home Equipment · 3 buổi/tuần",
    split: "arnold",
    daysPerWeek: 3,
    environment: "home_equipment",
    goal: "hypertrophy",
    description: "Phiên bản rút gọn cho học viên có dumbbell/band tại nhà.",
    exercises: [
      { exerciseId: "dumbbell-floor-press", sets: 4, reps: "8-12" },
      { exerciseId: "dumbbell-row", sets: 4, reps: "10-12 mỗi bên" },
      { exerciseId: "dumbbell-lateral-raise", sets: 3, reps: "12-15" },
      { exerciseId: "biceps-curl", sets: 3, reps: "10-12" },
      { exerciseId: "band-row", sets: 3, reps: "12-15" },
    ],
  },
  {
    id: "mobility-rehab-2-home",
    name: "Mobility Recovery · 2 buổi/tuần",
    split: "full_body",
    daysPerWeek: 2,
    environment: "mobility_rehab",
    goal: "mobility",
    description: "Buổi phục hồi nhẹ, phù hợp ngày nghỉ hoặc học viên mới quay lại tập.",
    exercises: [
      { exerciseId: "cat-cow" },
      { exerciseId: "worlds-greatest-stretch" },
      { exerciseId: "hip-flexor-stretch" },
      { exerciseId: "thoracic-rotation" },
      { exerciseId: "band-external-rotation" },
      { exerciseId: "dead-bug" },
      { exerciseId: "bird-dog" },
    ],
  },
]

export function getExerciseById(exerciseId: string) {
  return exerciseLibrary.find((exercise) => exercise.id === exerciseId)
}

export function getExerciseIdByName(name: string) {
  return exerciseLibrary.find((exercise) => exercise.name === name)?.id
}

export function getFilteredExercises({
  environment,
  goal,
}: {
  environment: TrainingEnvironment
  goal: TrainingGoal
}) {
  return exerciseLibrary.filter(
    (exercise) =>
      exercise.environments.includes(environment) &&
      exercise.goals.includes(goal),
  )
}

export function getFilteredPresets({
  daysPerWeek,
  environment,
  goal,
  split,
}: {
  daysPerWeek: number
  environment: TrainingEnvironment
  goal: TrainingGoal
  split: TrainingSplit
}) {
  return workoutPresets.filter(
    (preset) =>
      preset.daysPerWeek === daysPerWeek &&
      preset.environment === environment &&
      preset.goal === goal &&
      preset.split === split,
  )
}
