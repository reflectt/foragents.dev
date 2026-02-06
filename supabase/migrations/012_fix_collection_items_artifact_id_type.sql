-- Fix collection_items.artifact_id type to match artifacts.id (TEXT)
-- Created: 2026-02-06

DO $$
DECLARE
  coltype text;
BEGIN
  SELECT data_type INTO coltype
  FROM information_schema.columns
  WHERE table_schema='public'
    AND table_name='collection_items'
    AND column_name='artifact_id';

  -- If table/column doesn't exist yet, nothing to do.
  IF coltype IS NULL THEN
    RETURN;
  END IF;

  -- Drop existing FK if present (it may have been created with uuid).
  BEGIN
    ALTER TABLE public.collection_items
      DROP CONSTRAINT IF EXISTS collection_items_artifact_id_fkey;
  EXCEPTION WHEN undefined_table THEN
    RETURN;
  END;

  -- If artifact_id is uuid, convert to text.
  IF coltype = 'uuid' THEN
    ALTER TABLE public.collection_items
      ALTER COLUMN artifact_id TYPE text USING artifact_id::text;
  END IF;

  -- Recreate FK as text -> text.
  ALTER TABLE public.collection_items
    ADD CONSTRAINT collection_items_artifact_id_fkey
    FOREIGN KEY (artifact_id) REFERENCES public.artifacts(id) ON DELETE CASCADE;
END $$;
