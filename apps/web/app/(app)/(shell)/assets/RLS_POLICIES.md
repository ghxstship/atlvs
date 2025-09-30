# Assets Module RLS Policies

## Implemented Policies

### 1. Organization Isolation
```sql
CREATE POLICY assets_org_isolation ON assets
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));
```

### 2. Read Access
```sql
CREATE POLICY assets_read ON assets
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid()
    )
  );
```

### 3. Create Access (Admin/Manager)
```sql
CREATE POLICY assets_create ON assets
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT m.organization_id FROM memberships m
      WHERE m.user_id = auth.uid() 
      AND m.role IN ('owner', 'admin', 'manager')
    )
  );
```

### 4. Update Access (Admin/Manager)
```sql
CREATE POLICY assets_update ON assets
  FOR UPDATE USING (
    organization_id IN (
      SELECT m.organization_id FROM memberships m
      WHERE m.user_id = auth.uid() 
      AND m.role IN ('owner', 'admin', 'manager')
    )
  );
```

### 5. Delete Access (Admin only)
```sql
CREATE POLICY assets_delete ON assets
  FOR DELETE USING (
    organization_id IN (
      SELECT m.organization_id FROM memberships m
      WHERE m.user_id = auth.uid() 
      AND m.role IN ('owner', 'admin')
    )
  );
```

## Status: ✅ IMPLEMENTED
