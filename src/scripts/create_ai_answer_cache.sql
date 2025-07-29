-- Create table for caching AI answers to repeated questions/entities
CREATE TABLE IF NOT EXISTS ai_answer_cache (
  id serial PRIMARY KEY,
  question_hash text UNIQUE,
  entity text,
  answer text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  hits integer DEFAULT 1
);

-- Index for fast lookup by question_hash
CREATE INDEX IF NOT EXISTS idx_ai_answer_cache_question_hash ON ai_answer_cache (question_hash); 