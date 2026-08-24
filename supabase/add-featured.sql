-- Run this once in Supabase SQL Editor for an existing database.
alter table certificates add column if not exists featured boolean not null default false;
alter table activities add column if not exists featured boolean not null default false;
