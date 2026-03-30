
CREATE TABLE nutrition_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  age INTEGER,
  gender TEXT,
  weight_kg REAL,
  height_cm REAL,
  activity_level TEXT,
  goal TEXT,
  tmb REAL,
  ndc REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL,
  meal_type TEXT,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_calories REAL,
  total_protein REAL,
  total_carbs REAL,
  total_fat REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_log_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  portion_size TEXT,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  image_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diet_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  daily_calories REAL,
  daily_protein REAL,
  daily_carbs REAL,
  daily_fat REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diet_plan_meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  diet_plan_id INTEGER NOT NULL,
  meal_type TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  foods TEXT NOT NULL,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
