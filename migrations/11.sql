
CREATE TABLE daily_meal_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER,
  meal_type TEXT,
  meal_name TEXT,
  foods TEXT,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  image_key TEXT,
  logged_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_meal_logs_date ON daily_meal_logs(logged_date);
CREATE INDEX idx_daily_meal_logs_profile ON daily_meal_logs(profile_id);
