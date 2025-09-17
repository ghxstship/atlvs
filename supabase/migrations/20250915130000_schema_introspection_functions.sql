-- =====================================================
-- SCHEMA INTROSPECTION FUNCTIONS FOR DATA VIEWS
-- =====================================================
-- These functions provide comprehensive schema introspection
-- capabilities for the DataViews Schema Validation Framework
-- =====================================================

-- Function to get all table information
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE (
    table_name TEXT,
    table_type TEXT,
    table_comment TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        t.table_type::TEXT,
        obj_description(c.oid)::TEXT as table_comment
    FROM information_schema.tables t
    LEFT JOIN pg_class c ON c.relname = t.table_name
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name;
END;
$$;

-- Function to get table columns with detailed information
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE (
    column_name TEXT,
    data_type TEXT,
    is_nullable TEXT,
    column_default TEXT,
    character_maximum_length INTEGER,
    numeric_precision INTEGER,
    numeric_scale INTEGER,
    enum_values TEXT[],
    column_comment TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::TEXT,
        CASE 
            WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name::TEXT
            ELSE c.data_type::TEXT
        END as data_type,
        c.is_nullable::TEXT,
        c.column_default::TEXT,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        CASE 
            WHEN c.data_type = 'USER-DEFINED' AND EXISTS (
                SELECT 1 FROM pg_type pt 
                WHERE pt.typname = c.udt_name AND pt.typtype = 'e'
            ) THEN (
                SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder)
                FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = c.udt_name
            )
            ELSE NULL
        END as enum_values,
        col_description(pgc.oid, c.ordinal_position)::TEXT as column_comment
    FROM information_schema.columns c
    LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
    WHERE c.table_schema = 'public'
    AND c.table_name = get_table_columns.table_name
    ORDER BY c.ordinal_position;
END;
$$;

-- Function to get table relationships (foreign keys)
CREATE OR REPLACE FUNCTION get_table_relationships(table_name TEXT)
RETURNS TABLE (
    constraint_name TEXT,
    column_name TEXT,
    foreign_table_name TEXT,
    foreign_column_name TEXT,
    on_delete TEXT,
    on_update TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.constraint_name::TEXT,
        kcu.column_name::TEXT,
        ccu.table_name::TEXT as foreign_table_name,
        ccu.column_name::TEXT as foreign_column_name,
        rc.delete_rule::TEXT as on_delete,
        rc.update_rule::TEXT as on_update
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints rc
        ON tc.constraint_name = rc.constraint_name
        AND tc.table_schema = rc.constraint_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = get_table_relationships.table_name;
END;
$$;

-- Function to get RLS policies for a table
CREATE OR REPLACE FUNCTION get_table_policies(table_name TEXT)
RETURNS TABLE (
    policy_name TEXT,
    command TEXT,
    roles TEXT[],
    using_expression TEXT,
    with_check_expression TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.policyname::TEXT as policy_name,
        p.cmd::TEXT as command,
        p.roles::TEXT[] as roles,
        p.qual::TEXT as using_expression,
        p.with_check::TEXT as with_check_expression
    FROM pg_policies p
    WHERE p.schemaname = 'public'
    AND p.tablename = get_table_policies.table_name;
END;
$$;

-- Function to get table triggers
CREATE OR REPLACE FUNCTION get_table_triggers(table_name TEXT)
RETURNS TABLE (
    trigger_name TEXT,
    event_manipulation TEXT,
    action_timing TEXT,
    action_statement TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.trigger_name::TEXT,
        t.event_manipulation::TEXT,
        t.action_timing::TEXT,
        t.action_statement::TEXT
    FROM information_schema.triggers t
    WHERE t.trigger_schema = 'public'
    AND t.event_object_table = get_table_triggers.table_name;
END;
$$;

-- Function to get table indexes
CREATE OR REPLACE FUNCTION get_table_indexes(table_name TEXT)
RETURNS TABLE (
    index_name TEXT,
    index_type TEXT,
    columns TEXT[],
    is_unique BOOLEAN,
    is_partial BOOLEAN,
    definition TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.indexname::TEXT as index_name,
        am.amname::TEXT as index_type,
        ARRAY(
            SELECT a.attname
            FROM pg_attribute a
            WHERE a.attrelid = i.indexrelid
            AND a.attnum > 0
            ORDER BY a.attnum
        ) as columns,
        idx.indisunique as is_unique,
        (idx.indpred IS NOT NULL) as is_partial,
        i.indexdef::TEXT as definition
    FROM pg_indexes i
    JOIN pg_class c ON c.relname = i.indexname
    JOIN pg_index idx ON idx.indexrelid = c.oid
    JOIN pg_am am ON am.oid = c.relam
    WHERE i.schemaname = 'public'
    AND i.tablename = get_table_indexes.table_name;
END;
$$;

-- Function to get table permissions
CREATE OR REPLACE FUNCTION get_table_permissions(table_name TEXT)
RETURNS TABLE (
    grantee TEXT,
    privilege_type TEXT,
    is_grantable TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tp.grantee::TEXT,
        tp.privilege_type::TEXT,
        tp.is_grantable::TEXT
    FROM information_schema.table_privileges tp
    WHERE tp.table_schema = 'public'
    AND tp.table_name = get_table_permissions.table_name;
END;
$$;

-- Function to get all views information
CREATE OR REPLACE FUNCTION get_views_info()
RETURNS TABLE (
    view_name TEXT,
    view_definition TEXT,
    dependencies TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.table_name::TEXT as view_name,
        v.view_definition::TEXT,
        ARRAY[]::TEXT[] as dependencies -- Simplified for now
    FROM information_schema.views v
    WHERE v.table_schema = 'public'
    ORDER BY v.table_name;
END;
$$;

-- Function to get view columns
CREATE OR REPLACE FUNCTION get_view_columns(view_name TEXT)
RETURNS TABLE (
    column_name TEXT,
    data_type TEXT,
    is_nullable TEXT,
    character_maximum_length INTEGER,
    numeric_precision INTEGER,
    numeric_scale INTEGER,
    column_comment TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::TEXT,
        c.data_type::TEXT,
        c.is_nullable::TEXT,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        col_description(pgc.oid, c.ordinal_position)::TEXT as column_comment
    FROM information_schema.columns c
    LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
    WHERE c.table_schema = 'public'
    AND c.table_name = get_view_columns.view_name
    ORDER BY c.ordinal_position;
END;
$$;

-- Function to get all functions information
CREATE OR REPLACE FUNCTION get_functions_info()
RETURNS TABLE (
    function_name TEXT,
    parameters JSONB,
    return_type TEXT,
    security_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.proname::TEXT as function_name,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'name', COALESCE(param_names[i], 'param_' || i),
                    'data_type', format_type(param_types[i], NULL),
                    'default_value', NULL
                )
            ) FILTER (WHERE param_types IS NOT NULL),
            '[]'::jsonb
        ) as parameters,
        format_type(p.prorettype, NULL)::TEXT as return_type,
        CASE p.prosecdef 
            WHEN true THEN 'DEFINER'
            ELSE 'INVOKER'
        END::TEXT as security_type
    FROM pg_proc p
    LEFT JOIN LATERAL (
        SELECT 
            p.proargnames as param_names,
            p.proargtypes::oid[] as param_types,
            generate_subscripts(p.proargtypes::oid[], 1) as i
    ) params ON true
    WHERE p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    GROUP BY p.proname, p.prorettype, p.prosecdef;
END;
$$;

-- Function to get custom types information
CREATE OR REPLACE FUNCTION get_custom_types_info()
RETURNS TABLE (
    type_name TEXT,
    type_definition TEXT,
    usage_locations TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.typname::TEXT as type_name,
        CASE 
            WHEN t.typtype = 'e' THEN 
                'ENUM(' || array_to_string(
                    ARRAY(
                        SELECT e.enumlabel 
                        FROM pg_enum e 
                        WHERE e.enumtypid = t.oid 
                        ORDER BY e.enumsortorder
                    ), 
                    ', '
                ) || ')'
            WHEN t.typtype = 'c' THEN 'COMPOSITE'
            WHEN t.typtype = 'd' THEN 'DOMAIN'
            ELSE 'OTHER'
        END::TEXT as type_definition,
        ARRAY[]::TEXT[] as usage_locations -- Simplified for now
    FROM pg_type t
    WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND t.typtype IN ('e', 'c', 'd') -- enum, composite, domain
    ORDER BY t.typname;
END;
$$;

-- Function to get table constraints with detailed information
CREATE OR REPLACE FUNCTION get_table_constraints(table_name TEXT)
RETURNS TABLE (
    constraint_name TEXT,
    constraint_type TEXT,
    column_names TEXT[],
    definition TEXT,
    referenced_table TEXT,
    referenced_columns TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.constraint_name::TEXT,
        tc.constraint_type::TEXT,
        ARRAY_AGG(kcu.column_name ORDER BY kcu.ordinal_position)::TEXT[] as column_names,
        COALESCE(cc.check_clause, '')::TEXT as definition,
        ccu.table_name::TEXT as referenced_table,
        CASE 
            WHEN tc.constraint_type = 'FOREIGN KEY' THEN
                ARRAY_AGG(ccu.column_name ORDER BY kcu.ordinal_position)::TEXT[]
            ELSE NULL
        END as referenced_columns
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    LEFT JOIN information_schema.check_constraints cc
        ON tc.constraint_name = cc.constraint_name
        AND tc.table_schema = cc.constraint_schema
    WHERE tc.table_schema = 'public'
    AND tc.table_name = get_table_constraints.table_name
    GROUP BY tc.constraint_name, tc.constraint_type, cc.check_clause, ccu.table_name;
END;
$$;

-- Function to validate data against schema constraints
CREATE OR REPLACE FUNCTION validate_data_against_schema(
    table_name TEXT,
    data_json JSONB
)
RETURNS TABLE (
    field TEXT,
    constraint_type TEXT,
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    col_record RECORD;
    constraint_record RECORD;
    field_value TEXT;
    is_valid_result BOOLEAN;
    error_msg TEXT;
BEGIN
    -- Validate against column constraints
    FOR col_record IN 
        SELECT * FROM get_table_columns(table_name)
    LOOP
        field_value := data_json ->> col_record.column_name;
        is_valid_result := true;
        error_msg := '';

        -- Check NOT NULL constraint
        IF col_record.is_nullable = 'NO' AND (field_value IS NULL OR field_value = '') THEN
            is_valid_result := false;
            error_msg := col_record.column_name || ' cannot be null';
        END IF;

        -- Check data type compatibility
        IF field_value IS NOT NULL AND field_value != '' THEN
            BEGIN
                CASE col_record.data_type
                    WHEN 'integer', 'bigint', 'smallint' THEN
                        PERFORM field_value::INTEGER;
                    WHEN 'numeric', 'decimal', 'real', 'double precision' THEN
                        PERFORM field_value::NUMERIC;
                    WHEN 'boolean' THEN
                        PERFORM field_value::BOOLEAN;
                    WHEN 'date' THEN
                        PERFORM field_value::DATE;
                    WHEN 'timestamp', 'timestamptz' THEN
                        PERFORM field_value::TIMESTAMP;
                    WHEN 'uuid' THEN
                        PERFORM field_value::UUID;
                    ELSE
                        -- Text types and others are generally valid
                        NULL;
                END CASE;
            EXCEPTION WHEN OTHERS THEN
                is_valid_result := false;
                error_msg := col_record.column_name || ' has invalid data type';
            END;
        END IF;

        -- Check character length constraints
        IF col_record.character_maximum_length IS NOT NULL 
           AND LENGTH(field_value) > col_record.character_maximum_length THEN
            is_valid_result := false;
            error_msg := col_record.column_name || ' exceeds maximum length of ' || col_record.character_maximum_length;
        END IF;

        -- Check enum values
        IF col_record.enum_values IS NOT NULL 
           AND field_value IS NOT NULL 
           AND NOT (field_value = ANY(col_record.enum_values)) THEN
            is_valid_result := false;
            error_msg := col_record.column_name || ' must be one of: ' || array_to_string(col_record.enum_values, ', ');
        END IF;

        RETURN QUERY SELECT 
            col_record.column_name::TEXT,
            'column_constraint'::TEXT,
            is_valid_result,
            error_msg::TEXT;
    END LOOP;

    -- Validate against table constraints (check constraints, etc.)
    FOR constraint_record IN 
        SELECT * FROM get_table_constraints(table_name) 
        WHERE constraint_type = 'CHECK'
    LOOP
        -- This would require dynamic SQL execution to validate check constraints
        -- For now, we'll return a placeholder
        RETURN QUERY SELECT 
            array_to_string(constraint_record.column_names, ', ')::TEXT,
            'check_constraint'::TEXT,
            true, -- Placeholder - would need dynamic validation
            ''::TEXT;
    END LOOP;
END;
$$;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_relationships(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_policies(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_triggers(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_indexes(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_permissions(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_views_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_view_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_functions_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_custom_types_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_constraints(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_data_against_schema(TEXT, JSONB) TO authenticated;

-- Grant permissions to service role
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
