
CREATE TABLE workout_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  workout_date DATE NOT NULL,
  sport_category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_calendar_user_date ON workout_calendar(user_id, workout_date);
