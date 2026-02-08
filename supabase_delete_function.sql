-- Allow users to delete their own account
create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete data first (Cascading usually handles this, but good to be explicit if needed)
  -- delete from public.habits where user_id = auth.uid();
  
  -- Delete the auth user
  delete from auth.users where id = auth.uid();
end;
$$;
