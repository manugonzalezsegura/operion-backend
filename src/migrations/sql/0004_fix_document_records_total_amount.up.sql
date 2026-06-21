ALTER TABLE document_records
    ALTER COLUMN total_amount TYPE NUMERIC(15, 2)
    USING total_amount::NUMERIC(15, 2);

ALTER TABLE document_records
    ADD CONSTRAINT CHK_document_records_total_amount_positive
    CHECK (total_amount IS NULL OR total_amount > 0);
