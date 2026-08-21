-- Continue/Pass decisions stay private until trusted server-side logic has
-- derived the combined result for the Q&A participants.

drop policy if exists "participants can read their own q&a outcome" on public.qa_outcomes;

create policy "users can read their own q&a outcome"
on public.qa_outcomes for select
to authenticated
using (user_id = auth.uid());
