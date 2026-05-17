
-- Analytics tables for NalarUp baseline tracking
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS analytics_pageviews (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT DEFAULT '',
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_durations (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON analytics_pageviews(path);
CREATE INDEX IF NOT EXISTS idx_pageviews_created ON analytics_pageviews(created_at);
CREATE INDEX IF NOT EXISTS idx_durations_path ON analytics_durations(path);
CREATE INDEX IF NOT EXISTS idx_durations_created ON analytics_durations(created_at);

-- Useful views
CREATE OR REPLACE VIEW analytics_daily_summary AS
SELECT 
  DATE(created_at) as date,
  path,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_pageviews
GROUP BY DATE(created_at), path
ORDER BY date DESC, views DESC;
