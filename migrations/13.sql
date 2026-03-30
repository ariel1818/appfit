
CREATE TABLE personal_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER,
  profile_id INTEGER,
  weight_kg REAL,
  reps INTEGER,
  record_type TEXT,
  achieved_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_personal_records_exercise ON personal_records(exercise_id);
CREATE INDEX idx_personal_records_profile ON personal_records(profile_id);
