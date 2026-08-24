-- Run once in Supabase SQL Editor for an existing database.
alter table projects add column if not exists show_visit boolean not null default true;
alter table projects add column if not exists show_github boolean not null default true;
