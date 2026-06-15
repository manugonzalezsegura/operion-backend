CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================
-- ENUM: document_channel_enum
-- =====================================
DO $$
BEGIN
    CREATE TYPE document_channel_enum AS ENUM ('WHATSAPP', 'EMAIL', 'MANUAL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================
-- ENUM: document_type_enum
-- =====================================
DO $$
BEGIN
    CREATE TYPE document_type_enum AS ENUM ('INVOICE', 'RECEIPT', 'CONTRACT', 'PAYMENT_PROOF', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================
-- ENUM: ocr_status_enum
-- =====================================
DO $$
BEGIN
    CREATE TYPE ocr_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'NEEDS_REVIEW');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================
-- ENUM: document_status_enum
-- =====================================
DO $$
BEGIN
    CREATE TYPE document_status_enum AS ENUM ('RECEIVED', 'STORED', 'PROCESSED', 'NEEDS_REVIEW', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================
-- ENUM: reminder_status_enum
-- =====================================
DO $$
BEGIN
    CREATE TYPE reminder_status_enum AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================
-- ENUM: financial_direction_enum
-- =====================================
DO $$
BEGIN
    CREATE TYPE financial_direction_enum AS ENUM ('PAYABLE', 'RECEIVABLE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================
-- TABLE: document_records
-- =====================================
CREATE TABLE document_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    source_channel document_channel_enum NOT NULL,
    sender_identifier VARCHAR(255),
    original_file_name VARCHAR(255),
    mime_type VARCHAR(255),
    document_type document_type_enum NOT NULL DEFAULT 'OTHER',
    provider_name VARCHAR(255),
    counterparty_rut VARCHAR(255),
    counterparty_name VARCHAR(255),
    financial_direction financial_direction_enum,
    external_message_id VARCHAR(255),
    folio VARCHAR(255),
    issue_date DATE,
    due_date DATE,
    total_amount NUMERIC,
    currency VARCHAR(10) NOT NULL DEFAULT 'CLP',
    ocr_text TEXT,
    ocr_status ocr_status_enum NOT NULL DEFAULT 'PENDING',
    processing_status document_status_enum NOT NULL DEFAULT 'RECEIVED',
    storage_provider VARCHAR(255),
    storage_folder_id VARCHAR(255),
    storage_file_id VARCHAR(255),
    storage_file_url VARCHAR(255),
    spreadsheet_row_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_document_records_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION
);

CREATE INDEX idx_document_records_tenant_id
ON document_records(tenant_id);

CREATE INDEX idx_document_records_source_channel
ON document_records(source_channel);

CREATE INDEX idx_document_records_due_date
ON document_records(due_date);

CREATE INDEX idx_document_records_tenant_counterparty_rut
ON document_records(tenant_id, counterparty_rut);

CREATE UNIQUE INDEX "UQ_document_records_tenant_channel_external_message"
ON document_records(tenant_id, source_channel, external_message_id);

CREATE UNIQUE INDEX "UQ_document_records_tenant_id"
ON document_records(tenant_id, id);

-- =====================================
-- TABLE: document_reminders
-- =====================================
CREATE TABLE document_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_record_id UUID NOT NULL,
    due_date DATE NOT NULL,
    remind_at TIMESTAMP NOT NULL,
    channel document_channel_enum NOT NULL DEFAULT 'WHATSAPP',
    status reminder_status_enum NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_document_reminders_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,
    CONSTRAINT fk_document_reminders_document_record
        FOREIGN KEY (tenant_id, document_record_id)
        REFERENCES document_records(tenant_id, id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION
);

CREATE INDEX idx_document_reminders_tenant_id
ON document_reminders(tenant_id);

CREATE INDEX idx_document_reminders_document_record_id
ON document_reminders(document_record_id);

CREATE INDEX idx_document_reminders_remind_at
ON document_reminders(remind_at);

CREATE INDEX idx_document_reminders_status
ON document_reminders(status);

-- =====================================
-- TABLE: document_payments
-- =====================================
CREATE TABLE document_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_record_id UUID NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    paid_at DATE NOT NULL,
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_document_payments_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,
    CONSTRAINT fk_document_payments_document_record
        FOREIGN KEY (tenant_id, document_record_id)
        REFERENCES document_records(tenant_id, id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,
    CONSTRAINT chk_document_payments_amount_positive
        CHECK (amount > 0)
);

CREATE INDEX idx_document_payments_tenant_document_record
ON document_payments(tenant_id, document_record_id);

CREATE INDEX idx_document_payments_paid_at
ON document_payments(paid_at);

-- =====================================
-- TABLE: tenant_document_settings
-- =====================================
CREATE TABLE tenant_document_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    google_drive_root_folder_id VARCHAR(255),
    google_sheet_id VARCHAR(255),
    default_reminder_days_before INTEGER NOT NULL DEFAULT 5,
    whatsapp_phone_number_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_tenant_document_settings_tenant_id" UNIQUE (tenant_id),
    CONSTRAINT fk_tenant_document_settings_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION
);