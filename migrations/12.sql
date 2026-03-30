
CREATE TABLE progress_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER,
  image_key TEXT,
  weight_kg REAL,
  notes TEXT,
  photo_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_photos_date ON progress_photos(photo_date);
CREATE INDEX idx_progress_photos_profile ON progress_photos(profile_id);
