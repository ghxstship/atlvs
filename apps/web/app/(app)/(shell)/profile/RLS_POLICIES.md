# Profile Module RLS Policies

## Implemented Policies

### 1. User Can Read Own Profile
```sql
CREATE POLICY profile_read_own ON user_profiles
  FOR SELECT USING (user_id = auth.uid());
```

### 2. User Can Update Own Profile
```sql
CREATE POLICY profile_update_own ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());
```

### 3. Organization Members Can View Profiles
```sql
CREATE POLICY profile_read_org ON user_profiles
  FOR SELECT USING (
    user_id IN (
      SELECT m2.user_id FROM memberships m1
      JOIN memberships m2 ON m1.organization_id = m2.organization_id
      WHERE m1.user_id = auth.uid()
    )
  );
```

### 4. Emergency Contacts (User Only)
```sql
CREATE POLICY emergency_contacts_own ON emergency_contacts
  FOR ALL USING (user_id = auth.uid());
```

## Status: ✅ IMPLEMENTED
