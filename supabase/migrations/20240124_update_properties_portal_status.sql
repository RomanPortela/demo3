-- Add portal status to properties
alter table public.properties
add column if not exists zonaprop_status text check (zonaprop_status in ('idle', 'published', 'error')) default 'idle',
add column if not exists zonaprop_url text;

-- Add index
create index if not exists idx_properties_zonaprop_status on public.properties(zonaprop_status);
