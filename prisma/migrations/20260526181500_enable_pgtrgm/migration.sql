CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for fuzzy text search
CREATE INDEX IF NOT EXISTS idx_company_name_trgm
  ON "Company" USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_subtopic_name_trgm
  ON "SubTopic" USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_interview_role_trgm
  ON "Interview" USING gin (role gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_subtopicentry_question_trgm
  ON "SubTopicEntry" USING gin ("exactQuestionText" gin_trgm_ops)
  WHERE "exactQuestionText" IS NOT NULL;
