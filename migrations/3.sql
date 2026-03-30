
CREATE TABLE workout_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  experience_level TEXT NOT NULL,
  primary_goal TEXT NOT NULL,
  training_days INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_plan_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  rest_seconds INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_plans_profile ON workout_plans(profile_id);
CREATE INDEX idx_workout_exercises_plan ON workout_plan_exercises(plan_id);
CREATE INDEX idx_workout_exercises_exercise ON workout_plan_exercises(exercise_id);
