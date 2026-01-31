# Supabase Setup Guide for Kala Design Co Admin Panel

This guide will help you set up Supabase database integration for the Kala Design Co website and admin panel.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic understanding of SQL and database concepts

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `kala-design-co`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Key** (anon/public key)

## Step 3: Update Configuration

1. Open `database/supabase-config.js`
2. Replace the placeholder values:

```javascript
// Replace these with your actual Supabase credentials
this.supabaseUrl = 'https://your-project-id.supabase.co';
this.supabaseKey = 'your-anon-key-here';
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `database/schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute all the SQL commands

This will create:
- All necessary tables (contact_forms, site_settings, seo_settings, etc.)
- Row Level Security policies
- Storage bucket for images
- Default data
- Indexes for performance

## Step 5: Configure Authentication (Optional)

If you want to use Supabase Auth instead of the simple login system:

1. Go to **Authentication** > **Settings**
2. Configure your site URL: `https://yourdomain.com`
3. Add redirect URLs for your admin panel
4. Update the login system in `admin/login.html` to use Supabase Auth

## Step 6: Set Up Storage (For Image Uploads)

1. Go to **Storage** in your Supabase dashboard
2. The `images` bucket should already be created by the schema
3. If not, create a new bucket named `images`
4. Make it public for image serving
5. Configure upload policies as needed

## Step 7: Test the Connection

1. Open your website in a browser
2. Check the browser console for any connection errors
3. Try submitting a contact form
4. Check the admin panel to see if data appears
5. Verify in Supabase dashboard that data is being stored

## Step 8: Environment Variables (Production)

For production deployment, consider using environment variables:

```javascript
// In supabase-config.js
this.supabaseUrl = process.env.SUPABASE_URL || 'your-fallback-url';
this.supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-fallback-key';
```

## Database Tables Overview

### contact_forms
Stores all contact form submissions with fields:
- id, name, email, phone, service, message, status, created_at, etc.

### site_settings
Single row table for site configuration:
- phone, email, address, social media links

### seo_settings
Single row table for SEO configuration:
- site_title, tagline, keywords, analytics_id, search_console

### page_content
Stores editable content for each page:
- page_name, title, description, hero_text, meta_title, etc.

### analytics_events
Logs user interactions and events:
- event_name, category, label, page_url, user_agent, etc.

### images
Manages uploaded images:
- filename, file_path, alt_text, folder, etc.

## Security Features

### Row Level Security (RLS)
- Contact forms: Public can insert, admin can read/update/delete
- Settings: Admin only access
- Page content: Public can read, admin can write
- Analytics: Public can insert events, admin can read
- Images: Admin only access

### Storage Policies
- Public read access to images
- Admin only upload/update/delete

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check your URL and API key
   - Ensure your project is active
   - Check browser console for CORS errors

2. **Permission Denied**
   - Verify RLS policies are set up correctly
   - Check if you're authenticated for admin operations

3. **Table Not Found**
   - Ensure you ran the complete schema.sql
   - Check table names match exactly

4. **Images Not Loading**
   - Verify storage bucket is public
   - Check file paths and permissions

### Debug Mode

Add this to your browser console to enable debug logging:

```javascript
localStorage.setItem('supabase.debug', 'true');
```

## Performance Optimization

### Indexes
The schema includes indexes for:
- Contact forms by date and status
- Analytics events by date and name
- Page content by name

### Caching
Consider implementing caching for:
- Site settings (rarely change)
- SEO settings (rarely change)
- Page content (changes infrequently)

## Backup and Maintenance

### Regular Backups
1. Go to **Settings** > **Database**
2. Use the backup feature or set up automated backups
3. Export important data regularly

### Monitoring
1. Monitor database usage in Supabase dashboard
2. Set up alerts for high usage
3. Review analytics data regularly

## Migration from localStorage

The system automatically falls back to localStorage if Supabase is unavailable, making migration seamless. Existing localStorage data will continue to work while you set up Supabase.

## Production Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Credentials updated in config files
- [ ] Connection tested successfully
- [ ] Contact forms working
- [ ] Admin panel functional
- [ ] Image uploads working (if needed)
- [ ] Analytics tracking active
- [ ] Backup strategy in place
- [ ] Monitoring set up

## Support

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

For project-specific issues, check the browser console and verify your configuration matches this guide.