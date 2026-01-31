# 🔧 Supabase SQL Troubleshooting Guide

Common errors and solutions when setting up the Kala Design Co database schema.

## ❌ Permission Denied Errors

### Error: `permission denied to set parameter "app.jwt_secret"`
**Solution**: This line has been removed from the schema. JWT secrets are managed automatically by Supabase.

### Error: `permission denied for schema storage`
**Solution**: Use the minimal schema (`schema-minimal.sql`) which doesn't include storage bucket creation.

### Error: `must be owner of database`
**Solution**: Some commands require superuser privileges. Use the minimal schema instead.

## ❌ Syntax Errors

### Error: `syntax error at or near "s"`
**Solution**: Fixed! Apostrophes in SQL strings are now properly escaped (e.g., `'Let''s Create Together'`).

### Error: `unterminated dollar-quoted string`
**Solution**: Fixed! Function definitions now use proper `$$` syntax.

## ❌ Table/Column Errors

### Error: `relation "contact_forms" does not exist`
**Solution**: Make sure you ran the complete schema. Tables are created in order.

### Error: `column "updated_at" does not exist`
**Solution**: The trigger function creates this automatically. Ensure the full schema ran.

## 🛠️ Solutions by Error Type

### 1. Permission Issues
```sql
-- Use the minimal schema instead
-- File: database/schema-minimal.sql
-- This removes all superuser-only commands
```

### 2. Storage Issues
```sql
-- Create storage bucket manually in Supabase dashboard:
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create new bucket named "images"
-- 3. Make it public
-- 4. Set up policies as needed
```

### 3. RLS Policy Issues
```sql
-- If RLS policies fail, you can create them manually:
-- Go to Authentication > Policies in Supabase dashboard
-- Create policies for each table as needed
```

## 📋 Step-by-Step Recovery

### If Full Schema Fails:

1. **Try Minimal Schema**
   ```sql
   -- Copy contents of database/schema-minimal.sql
   -- Paste in Supabase SQL Editor
   -- Run
   ```

2. **Create Storage Manually**
   - Go to Supabase Dashboard → Storage
   - Create bucket named "images"
   - Make it public

3. **Add Missing Policies**
   - Go to Authentication → Policies
   - Add policies for admin operations

4. **Test Connection**
   - Open `database/config-checker.html`
   - Verify all tests pass

### If Minimal Schema Fails:

1. **Create Tables One by One**
   ```sql
   -- Copy each CREATE TABLE statement individually
   -- Run them one at a time
   ```

2. **Skip Problematic Features**
   - Skip storage bucket creation
   - Skip complex RLS policies
   - Add them later through dashboard

3. **Use Basic Setup**
   ```sql
   -- Just create the essential tables:
   -- contact_forms, site_settings, page_content
   ```

## 🔍 Debugging Tips

### Check Your Permissions
```sql
-- Run this to see your current role:
SELECT current_user, current_database();

-- Check if you can create tables:
CREATE TABLE test_permissions (id INTEGER);
DROP TABLE test_permissions;
```

### Verify Schema Step by Step
```sql
-- Check if tables exist:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if RLS is enabled:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables WHERE schemaname = 'public';
```

### Test Basic Operations
```sql
-- Test insert:
INSERT INTO contact_forms (name, email, message) 
VALUES ('Test', 'test@example.com', 'Test message');

-- Test select:
SELECT * FROM contact_forms LIMIT 1;
```

## 🚨 Emergency Fallback

If nothing works, the system will automatically use localStorage:

1. **Skip Database Setup**
   - Don't update `supabase-config.js`
   - Leave placeholder values

2. **Use Admin Panel**
   - Everything still works with localStorage
   - Data saved locally in browser

3. **Set Up Later**
   - Configure Supabase when convenient
   - Data will migrate automatically

## 📞 Getting Help

### Check These First:
1. **Browser Console** - Look for JavaScript errors
2. **Supabase Logs** - Check your project logs
3. **Network Tab** - Verify API calls are working

### Common Solutions:
- **Clear browser cache** and try again
- **Refresh Supabase dashboard** and retry
- **Use incognito mode** to test
- **Check project status** in Supabase dashboard

### Still Stuck?
1. Use the minimal schema (`schema-minimal.sql`)
2. Create storage bucket manually in dashboard
3. Set up RLS policies through the UI
4. Test with `config-checker.html`

## ✅ Success Indicators

When everything is working:
- ✅ No errors in browser console
- ✅ Contact forms appear in admin panel
- ✅ Settings changes persist after refresh
- ✅ `config-checker.html` shows all green
- ✅ `setup-status.html` shows 100% complete

## 📚 Additional Resources

- [Supabase SQL Editor Docs](https://supabase.com/docs/guides/database/overview)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Setup Guide](https://supabase.com/docs/guides/storage)
- [Troubleshooting Guide](https://supabase.com/docs/guides/platform/troubleshooting)

---

**Remember**: The system is designed to work with or without Supabase. If you can't get the database working immediately, you can still use all features with localStorage fallback!