alter table public.storage_spaces
add column if not exists display_order integer;

with ordered_spaces as (
  select
    id,
    row_number() over (order by created_at asc, id asc) - 1 as next_display_order
  from public.storage_spaces
)
update public.storage_spaces as storage_spaces
set display_order = ordered_spaces.next_display_order
from ordered_spaces
where storage_spaces.id = ordered_spaces.id
  and storage_spaces.display_order is null;

alter table public.storage_spaces
alter column display_order set not null;
