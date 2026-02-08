-- Enable pg_net extension if not enabled
create extension if not exists pg_net;

-- Create a function to call the Edge Function
create or replace function public.handle_new_announcement()
returns trigger as $$
begin
  perform
    net.http_post(
      url := 'https://npycdxtnyzxiqfjfopsy.supabase.co/functions/v1/push-dispatcher',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
      body := jsonb_build_object('record', to_jsonb(new))
    );
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create or replace trigger on_new_announcement
  after insert on public.announcements
  for each row execute procedure public.handle_new_announcement();
