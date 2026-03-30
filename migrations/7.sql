
CREATE TABLE bioimpedance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER,
  weight_kg REAL,
  body_fat_percentage REAL,
  muscle_mass_kg REAL,
  water_percentage REAL,
  bone_mass_kg REAL,
  visceral_fat_level INTEGER,
  bmr REAL,
  metabolic_age INTEGER,
  measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bioimpedance_profile ON bioimpedance_records(profile_id);
CREATE INDEX idx_bioimpedance_measured_at ON bioimpedance_records(measured_at);
