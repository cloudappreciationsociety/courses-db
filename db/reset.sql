DROP SCHEMA public CASCADE;

CREATE SCHEMA public;

-- Clearing entries of all relations

DO $$ 
DECLARE 
    tables_to_truncate TEXT; 
BEGIN 
    -- Gather all tables from the current schema into a comma-separated string
    SELECT string_agg(format('%I.%I', schemaname, tablename), ', ' ORDER BY tablename) 
    INTO tables_to_truncate 
    FROM pg_tables 
    WHERE schemaname = current_schema(); 

    -- Truncate each table
    IF tables_to_truncate IS NOT NULL THEN 
        EXECUTE 'TRUNCATE TABLE ' || tables_to_truncate || ' RESTART IDENTITY CASCADE'; 
    END IF; 
END $$;