-- Migration: Add metadata generation claim columns and atomic claim function
-- Adjust table/column names if they differ in your schema.

-- 1. Add columns if not exist
ALTER TABLE notebooks
ADD COLUMN IF NOT EXISTS metadata_generation_status text,
ADD COLUMN IF NOT EXISTS metadata_generation_claimed_at timestamptz,
ADD COLUMN IF NOT EXISTS metadata_generation_worker_id text;

-- 2. Optional: index to speed up lookups on status
CREATE INDEX IF NOT EXISTS notebooks_metadata_generation_status_idx ON notebooks (metadata_generation_status);
CREATE INDEX IF NOT EXISTS notebooks_metadata_generation_claimed_at_idx ON notebooks (metadata_generation_claimed_at);

-- 3. Atomic claim function with timeout reclamation
CREATE OR REPLACE FUNCTION claim_notebook_metadata(
  p_notebook_id uuid,
  p_worker_id text,
  p_timeout_seconds integer DEFAULT 900
) RETURNS TABLE(id uuid, claimed boolean) LANGUAGE plpgsql AS $$
DECLARE
BEGIN
  -- Attempt to claim if:
  --   status is NULL/pending/failed/expired OR
  --   status is processing but stale (older than timeout)
  RETURN QUERY
  UPDATE notebooks n SET
    metadata_generation_status = 'processing',
    metadata_generation_claimed_at = now(),
    metadata_generation_worker_id = p_worker_id
  WHERE n.id = p_notebook_id
    AND (
      n.metadata_generation_status IS NULL OR
      n.metadata_generation_status IN ('pending','failed','expired') OR
      (n.metadata_generation_status = 'processing' AND n.metadata_generation_claimed_at < (now() - make_interval(secs => p_timeout_seconds)) )
    )
  RETURNING n.id, true AS claimed;

  IF NOT FOUND THEN
    RETURN QUERY SELECT p_notebook_id, false AS claimed;
  END IF;
END;$$;

-- 4. (Optional) Completion/Failure helper functions
CREATE OR REPLACE FUNCTION complete_notebook_metadata(
  p_notebook_id uuid
) RETURNS void LANGUAGE sql AS $$
  UPDATE notebooks SET metadata_generation_status = 'completed' WHERE id = p_notebook_id;
$$;

CREATE OR REPLACE FUNCTION fail_notebook_metadata(
  p_notebook_id uuid
) RETURNS void LANGUAGE sql AS $$
  UPDATE notebooks SET metadata_generation_status = 'failed' WHERE id = p_notebook_id;
$$;

-- 5. Grant execute (adjust role names to match RLS config)
GRANT EXECUTE ON FUNCTION claim_notebook_metadata(uuid,text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION complete_notebook_metadata(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION fail_notebook_metadata(uuid) TO service_role;
