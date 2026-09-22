# Assessment backend handoff

My Pain is connected to Supabase. Keep its existing parent `Assessment` insert and
linked `pain_assessment` insert working.

Movement, Personal Care, Social Health, and Management currently run in the UI
only. Their answers, summaries, completion indicators, and Edit actions remain
available in memory for the current app session. They do not write to Supabase.

To connect one of these four assessments:

1. Confirm the table, columns, constraints, and ownership policies with the backend team.
2. Add its mapping to `buildAssessmentInsert` in `assessment-repository.ts`.
   It currently returns `null` for those four assessment IDs. If the agreed backend
   uses the same parent/child schema as My Pain, the existing save flow can be reused;
   otherwise implement the appropriate save operation before enabling the mapping.
3. Keep the screen's existing `persist` callback. It already passes the answers to
   `saveAssessmentRecord`, and the shared form handles saving errors and retrying.
4. Add the approved migration and replace that assessment's no-backend test with
   tests for its actual save behavior. Verify with a signed-in test account.

`202609220001_add_remaining_assessments.sql` is retained as a comment-only placeholder.
No remote tables, existing records, or previously applied policies were removed.
