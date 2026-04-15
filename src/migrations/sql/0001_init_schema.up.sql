
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================
-- TABLA: tenants
-- =====================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- =====================================
-- TABLA: roles
-- =====================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- =====================================
-- TABLA: users
-- =====================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    tenant_id UUID NOT NULL,
    CONSTRAINT fk_users_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION
);

-- =====================================
-- TABLA: product_passport_statuses
-- =====================================
CREATE TABLE product_passport_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- =====================================
-- TABLA: product_passports
-- =====================================
CREATE TABLE product_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(150) NOT NULL,
    description TEXT,
    tenant_id UUID NOT NULL,
    status_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_passports_tenant_sku UNIQUE (sku, tenant_id),
    CONSTRAINT fk_product_passports_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,
    CONSTRAINT fk_product_passports_status
        FOREIGN KEY (status_id)
        REFERENCES product_passport_statuses(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION
);

-- =====================================
-- ÍNDICES
-- =====================================
CREATE INDEX idx_product_passports_status_id
ON product_passports(status_id);

-- =====================================
-- SEED INICIAL: product_passport_statuses
-- =====================================
INSERT INTO product_passport_statuses (code, name, description)
VALUES
    ('DRAFT', 'Draft', 'Product passport in preparation'),
    ('ACTIVE', 'Active', 'Product passport active and usable'),
    ('ARCHIVED', 'Archived', 'Product passport archived');