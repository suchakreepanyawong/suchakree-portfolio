-- Mark at most one project as the portfolio Master Piece.
alter table projects
  add column if not exists master_piece boolean not null default false;

create unique index if not exists projects_one_master_piece_idx
  on projects (master_piece)
  where master_piece = true;