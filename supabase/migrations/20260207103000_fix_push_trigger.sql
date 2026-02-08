-- Create a function to call the Edge Function
create or replace function public.handle_new_announcement()
returns trigger as $$
begin
  perform
    net.http_post(
      url := 'https://npycdxtnyzxiqfjfopsy.supabase.co/functions/v1/push-dispatcher',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('record', to_jsonb(new))
    );
  return new;
end;
$$ language plpgsql security definer;
