-- Share events tracking table
CREATE TABLE IF NOT EXISTS share_events (
  id SERIAL PRIMARY KEY,
  medal_slug TEXT NOT NULL,
  platform TEXT NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS share_events_medal_slug_idx ON share_events (medal_slug);
CREATE INDEX IF NOT EXISTS share_events_platform_idx ON share_events (platform);
CREATE INDEX IF NOT EXISTS share_events_created_at_idx ON share_events (created_at);
