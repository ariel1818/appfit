
-- Create table for storing water intake logs
CREATE TABLE water_logs (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id TEXT,
amount_ml INTEGER,
logged_date DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_water_logs_date ON water_logs(logged_date);
CREATE INDEX idx_water_logs_user ON water_logs(user_id);
