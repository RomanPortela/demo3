-- Add linking fields to calendar_events
alter table public.calendar_events
add column if not exists client_id bigint references public.clients(id) on delete set null,
add column if not exists lead_id bigint references public.leads(id) on delete set null,
add column if not exists property_id bigint references public.properties(id) on delete set null,
add column if not exists event_type text check (event_type in ('meeting', 'visit', 'task', 'other')) default 'other';

-- Add event link to tasks
alter table public.tasks
add column if not exists event_id bigint references public.calendar_events(id) on delete set null;

-- Add index for performance
create index if not exists idx_calendar_events_client on public.calendar_events(client_id);
create index if not exists idx_calendar_events_property on public.calendar_events(property_id);
create index if not exists idx_tasks_event on public.tasks(event_id);
