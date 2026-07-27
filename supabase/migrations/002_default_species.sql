-- Steady pet species: white-label default species a tenant's brand-new
-- users start with. Never overrides a user's own later choice (see
-- src/lib/storage.ts's defaultState()/load()).

alter table tenants
  add column if not exists default_species text not null default 'turtle'
    check (default_species in ('turtle', 'fox', 'dog', 'cat', 'rabbit', 'bear'));
