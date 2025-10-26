-- Crear tabla de gastos (expenses)
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  amount numeric not null,
  date date default now(),
  type text check (type in ('fijo','variable'))
);

-- Crear tabla de ingresos (income)
create table if not exists income (
  id uuid primary key default uuid_generate_v4(),
  description text not null,
  amount numeric not null,
  date date default now()
);

-- Crear tabla de ahorros (savings)
create table if not exists savings (
  id uuid primary key default uuid_generate_v4(),
  amount numeric not null,
  date date default now()
);
