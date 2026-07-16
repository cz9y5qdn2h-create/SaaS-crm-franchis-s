-- Essaimo — schéma initial (Phase 1 : socle multi-tenant + CRUD franchisés)
-- Voir docs/cadrage-produit.md pour le contexte produit.

create type organization_role as enum ('admin', 'member');

create type franchisee_status as enum (
  'lead',
  'qualifie',
  'dossier_envoye',
  'contrat_en_signature',
  'actif',
  'resilie'
);

create type contract_status as enum ('brouillon', 'envoye', 'signe', 'refuse');

-- Un compte = une organisation (le franchiseur).
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Membres d'une organisation (équipe du franchiseur), liés à auth.users.
create table organization_members (
  organization_id uuid not null references organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role organization_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table franchisees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  zone text,
  status franchisee_status not null default 'lead',
  dippro_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table franchisee_activities (
  id uuid primary key default gen_random_uuid(),
  franchisee_id uuid not null references franchisees (id) on delete cascade,
  organization_id uuid not null references organizations (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  franchisee_id uuid not null references franchisees (id) on delete cascade,
  organization_id uuid not null references organizations (id) on delete cascade,
  status contract_status not null default 'brouillon',
  provider text,
  external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subscriptions (
  organization_id uuid primary key references organizations (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'trialing',
  updated_at timestamptz not null default now()
);

create index franchisees_organization_id_idx on franchisees (organization_id);
create index franchisee_activities_franchisee_id_idx on franchisee_activities (franchisee_id);
create index contracts_franchisee_id_idx on contracts (franchisee_id);

-- Isolation multi-tenant : chaque table métier est filtrée par appartenance
-- de l'utilisateur à l'organisation via organization_members.
create or replace function is_organization_member(target_org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from organization_members m
    where m.organization_id = target_org
      and m.user_id = auth.uid()
  );
$$;

alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table franchisees enable row level security;
alter table franchisee_activities enable row level security;
alter table contracts enable row level security;
alter table subscriptions enable row level security;

create policy "Members can view their organization"
  on organizations for select
  using (is_organization_member(id));

create policy "Members can view their membership rows"
  on organization_members for select
  using (is_organization_member(organization_id));

create policy "Members can manage franchisees in their organization"
  on franchisees for all
  using (is_organization_member(organization_id))
  with check (is_organization_member(organization_id));

create policy "Members can manage activities in their organization"
  on franchisee_activities for all
  using (is_organization_member(organization_id))
  with check (is_organization_member(organization_id));

create policy "Members can manage contracts in their organization"
  on contracts for all
  using (is_organization_member(organization_id))
  with check (is_organization_member(organization_id));

create policy "Members can view their subscription"
  on subscriptions for select
  using (is_organization_member(organization_id));

-- Point d'entrée unique pour créer une organisation à l'inscription : évite
-- d'exposer des policies INSERT sur organizations/organization_members, qui
-- permettraient sinon à un utilisateur de s'ajouter à une organisation existante.
create or replace function create_organization(org_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  insert into organizations (name) values (org_name) returning id into new_org_id;
  insert into organization_members (organization_id, user_id, role)
    values (new_org_id, auth.uid(), 'admin');
  insert into subscriptions (organization_id) values (new_org_id);
  return new_org_id;
end;
$$;
