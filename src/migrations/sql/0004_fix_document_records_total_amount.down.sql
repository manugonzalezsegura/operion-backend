ALTER TABLE document_records
    DROP CONSTRAINT IF EXISTS CHK_document_records_total_amount_positive;

ALTER TABLE document_records
    ALTER COLUMN total_amount TYPE NUMERIC
    USING total_amount::NUMERIC;
