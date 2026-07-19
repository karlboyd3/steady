-- Steady multi-tenancy: clinic-branded tenant configuration.
-- Read server-side only, with the service-role key (see src/lib/tenant/get-tenant.ts).
-- No public policies are defined, so anon/publishable keys cannot read this table.

create table if not exists tenants (
  slug text primary key check (slug ~ '^[a-z0-9-]{2,32}$'),
  clinic_name text not null,
  logo_url text,
  icon_url text,
  color_primary text not null default '#2f6d5b' check (color_primary ~ '^#[0-9a-fA-F]{6}$'),
  color_accent text not null default '#e09a32' check (color_accent ~ '^#[0-9a-fA-F]{6}$'),
  color_background text not null default '#eff4f1' check (color_background ~ '^#[0-9a-fA-F]{6}$'),
  color_surface text not null default '#ffffff' check (color_surface ~ '^#[0-9a-fA-F]{6}$'),
  color_text text not null default '#22332d' check (color_text ~ '^#[0-9a-fA-F]{6}$'),
  mascot_enabled boolean not null default true,
  welcome_message text,
  contact_email text,
  custom_domain text unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into tenants (slug, clinic_name)
values ('default', 'Steady')
on conflict (slug) do nothing;

alter table tenants enable row level security;
-- Intentionally no policies: only the server-role client (bypasses RLS) reads this table.
