-- Family Timeline: day rhythm on check-ins for pattern analysis
ALTER TABLE daily_checkins
  ADD COLUMN IF NOT EXISTS day_type text DEFAULT 'weekday'
  CHECK (day_type IN ('weekday', 'weekend', 'holiday', 'school_holiday'));

COMMENT ON COLUMN daily_checkins.day_type IS 'Weekday/weekend/holiday rhythm for timeline and future pattern analysis';
