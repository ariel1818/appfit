
ALTER TABLE exercises ADD COLUMN sport_category TEXT;
UPDATE exercises SET sport_category = 'Musculação';
