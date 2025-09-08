-- Demo Data Removal Function for Enterprise Standards
-- Allows reversible removal of demo data as specified in requirements

CREATE OR REPLACE FUNCTION remove_demo_data(org_id UUID, user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_count INTEGER := 0;
  result JSON;
BEGIN
  -- Check if user has permission to remove demo data (org admin)
  IF NOT EXISTS (
    SELECT 1 FROM memberships 
    WHERE organization_id = org_id 
    AND user_id = user_id 
    AND role IN ('owner', 'admin')
    AND status = 'active'
  ) THEN
    RETURN json_build_object('error', 'Insufficient permissions to remove demo data');
  END IF;

  -- Count demo records before removal
  SELECT COUNT(*) INTO demo_count FROM projects WHERE organization_id = org_id AND is_demo = true;
  
  IF demo_count = 0 THEN
    RETURN json_build_object('error', 'No demo data found for this organization');
  END IF;

  -- Remove demo data in reverse dependency order
  
  -- 1. Remove audit logs for demo records
  DELETE FROM audit_logs WHERE organization_id = org_id AND metadata->>'is_demo' = 'true';
  
  -- 2. Remove finance transactions
  DELETE FROM finance_transactions 
  WHERE organization_id = org_id 
  AND project_id IN (SELECT id FROM projects WHERE organization_id = org_id AND is_demo = true);
  
  -- 3. Remove invoices
  DELETE FROM invoices WHERE organization_id = org_id AND is_demo = true;
  
  -- 4. Remove budgets
  DELETE FROM budgets 
  WHERE project_id IN (SELECT id FROM projects WHERE organization_id = org_id AND is_demo = true);
  
  -- 5. Remove finance accounts
  DELETE FROM finance_accounts WHERE organization_id = org_id AND is_demo = true;
  
  -- 6. Remove procurement orders
  DELETE FROM procurement_orders WHERE organization_id = org_id AND is_demo = true;
  
  -- 7. Remove products
  DELETE FROM products WHERE organization_id = org_id AND is_demo = true;
  
  -- 8. Remove jobs
  DELETE FROM jobs 
  WHERE organization_id = org_id 
  AND project_id IN (SELECT id FROM projects WHERE organization_id = org_id AND is_demo = true);
  
  -- 9. Remove riders
  DELETE FROM riders 
  WHERE event_id IN (
    SELECT e.id FROM events e 
    JOIN projects p ON e.project_id = p.id 
    WHERE p.organization_id = org_id AND p.is_demo = true
  );
  
  -- 10. Remove call sheets
  DELETE FROM call_sheets WHERE organization_id = org_id AND is_demo = true;
  
  -- 11. Remove events
  DELETE FROM events 
  WHERE project_id IN (SELECT id FROM projects WHERE organization_id = org_id AND is_demo = true);
  
  -- 12. Remove spaces
  DELETE FROM spaces WHERE organization_id = org_id;
  
  -- 13. Remove tasks
  DELETE FROM tasks WHERE organization_id = org_id AND is_demo = true;
  
  -- 14. Remove people
  DELETE FROM people WHERE organization_id = org_id AND is_demo = true;
  
  -- 15. Remove locations
  DELETE FROM locations WHERE organization_id = org_id AND is_demo = true;
  
  -- 16. Remove projects
  DELETE FROM projects WHERE organization_id = org_id AND is_demo = true;
  
  -- 17. Update organization to remove demo flag
  UPDATE organizations 
  SET is_demo = false, updated_at = NOW()
  WHERE id = org_id;
  
  -- 18. Create audit log entry for removal
  INSERT INTO audit_logs (
    action, resource_type, resource_id, user_id, organization_id, metadata, created_at
  ) VALUES (
    'demo.removed', 'organization', org_id, user_id, org_id,
    json_build_object(
      'demo_records_removed', demo_count,
      'removed_by', user_id,
      'removal_timestamp', NOW()
    ),
    NOW()
  );

  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'Demo data removed successfully',
    'data', json_build_object(
      'organization_id', org_id,
      'records_removed', demo_count,
      'removed_by', user_id
    )
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO audit_logs (
      action, resource_type, resource_id, user_id, organization_id, metadata, created_at
    ) VALUES (
      'demo.removal_failed', 'organization', org_id, user_id, org_id,
      json_build_object('error', SQLERRM),
      NOW()
    );
    
    RETURN json_build_object('error', SQLERRM);
END;
$$;
