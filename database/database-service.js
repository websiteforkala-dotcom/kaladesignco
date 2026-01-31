// Database Service for Supabase Integration
class DatabaseService {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for Supabase config to initialize
            await new Promise((resolve) => {
                const checkSupabase = () => {
                    if (window.supabaseConfig && window.supabaseConfig.supabase) {
                        this.supabase = window.supabaseConfig.supabase;
                        this.isInitialized = true;
                        resolve();
                    } else {
                        setTimeout(checkSupabase, 100);
                    }
                };
                checkSupabase();
            });
        } catch (error) {
            console.error('Failed to initialize database service:', error);
            // Fallback to localStorage if Supabase fails
            this.fallbackToLocalStorage = true;
        }
    }

    // Helper method to validate IP addresses
    isValidIP(ip) {
        if (!ip || typeof ip !== 'string') return false;

        // Check for IPv4 format
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (ipv4Regex.test(ip)) return true;

        // Check for IPv6 format (basic check)
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        if (ipv6Regex.test(ip)) return true;

        return false;
    }

    // Contact Forms Management
    async getContactForms() {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            return JSON.parse(localStorage.getItem('kala_contact_forms') || '[]');
        }

        try {
            const { data, error } = await this.supabase
                .from('contact_forms')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching contact forms:', error);
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('kala_contact_forms') || '[]');
        }
    }

    async addContactForm(formData) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const contacts = JSON.parse(localStorage.getItem('kala_contact_forms') || '[]');
            const newContact = {
                ...formData,
                id: Date.now(),
                created_at: new Date().toISOString()
            };
            contacts.unshift(newContact);
            localStorage.setItem('kala_contact_forms', JSON.stringify(contacts));
            return newContact;
        }

        try {
            // Validate and clean IP address
            let ipAddress = formData.ip || null;
            if (ipAddress && (ipAddress === "Hidden for privacy" || !this.isValidIP(ipAddress))) {
                ipAddress = null; // Set to null if invalid
            }

            const { data, error } = await this.supabase
                .from('contact_forms')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    service: formData.service || null,
                    message: formData.message,
                    ip_address: ipAddress,
                    user_agent: formData.userAgent || null,
                    status: 'new'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding contact form:', error);
            // Fallback to localStorage
            return this.addContactForm(formData);
        }
    }

    async deleteContactForm(id) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const contacts = JSON.parse(localStorage.getItem('kala_contact_forms') || '[]');
            const filtered = contacts.filter(contact => contact.id !== id);
            localStorage.setItem('kala_contact_forms', JSON.stringify(filtered));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from('contact_forms')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting contact form:', error);
            return false;
        }
    }

    async updateContactFormStatus(id, status) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            return true; // localStorage doesn't support status updates
        }

        try {
            const { error } = await this.supabase
                .from('contact_forms')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating contact form status:', error);
            return false;
        }
    }

    // Works Management
    async getWorks() {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            return JSON.parse(localStorage.getItem('kala_works') || '[]');
        }

        try {
            const { data, error } = await this.supabase
                .from('works')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // If table doesn't exist yet, return empty array/fallback
                // PGRST205: Could not find the table
                // 42P01: relation does not exist
                if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.code === '42P01' || error.message.includes('does not exist')) {
                    console.warn('Works table not found in Supabase. Falling back to local storage. Please run database/create_works_table.sql');
                    return JSON.parse(localStorage.getItem('kala_works') || '[]');
                }
                throw error;
            }
            return data || [];
        } catch (error) {
            console.error('Error fetching works:', error);
            return JSON.parse(localStorage.getItem('kala_works') || '[]');
        }
    }

    async addWork(workData) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const works = JSON.parse(localStorage.getItem('kala_works') || '[]');
            const newWork = {
                ...workData,
                id: Date.now(),
                created_at: new Date().toISOString()
            };
            works.unshift(newWork);
            localStorage.setItem('kala_works', JSON.stringify(works));
            return newWork;
        }

        try {
            const { data, error } = await this.supabase
                .from('works')
                .insert([{
                    title: workData.title,
                    category: workData.category,
                    description: workData.description,
                    location: workData.location,
                    year: workData.year,
                    image_url: workData.image_url,
                    featured: workData.featured || false
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding work:', error);
            // Fallback to localStorage
            return this.addWork(workData);
        }
    }

    async updateWork(id, workData) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const works = JSON.parse(localStorage.getItem('kala_works') || '[]');
            const index = works.findIndex(w => w.id === id);
            if (index !== -1) {
                works[index] = { ...works[index], ...workData, updated_at: new Date().toISOString() };
                localStorage.setItem('kala_works', JSON.stringify(works));
                return works[index];
            }
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('works')
                .update({
                    ...workData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating work:', error);
            throw error;
        }
    }

    async deleteWork(id) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const works = JSON.parse(localStorage.getItem('kala_works') || '[]');
            const filtered = works.filter(w => w.id !== id);
            localStorage.setItem('kala_works', JSON.stringify(filtered));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from('works')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting work:', error);
            // Try localStorage deletion too just in case
            this.fallbackToLocalStorage = true;
            return this.deleteWork(id);
        }
    }

    // Site Settings Management
    async getSiteSettings() {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const siteData = JSON.parse(localStorage.getItem('kala_site_data') || '{}');
            return siteData.settings || {
                phone: '+91 98765 43210',
                email: 'info@kaladesignco.com',
                address: 'Design District, New Delhi, India',
                facebook_url: 'https://facebook.com/kaladesignco',
                instagram_url: 'https://instagram.com/kaladesignco',
                linkedin_url: 'https://linkedin.com/company/kaladesignco',
                twitter_url: ''
            };
        }

        try {
            const { data, error } = await this.supabase
                .from('site_settings')
                .select('*')
                .single();

            if (error) {
                // Handle table not found or other errors
                if (error.code === 'PGRST116' || error.message.includes('406') || error.message.includes('Not Acceptable')) {
                    console.warn('Site settings table not found, using defaults. Please run database setup.');
                    // Return default settings if table doesn't exist
                    return {
                        phone: '+91 98765 43210',
                        email: 'info@kaladesignco.com',
                        address: 'Design District, New Delhi, India',
                        facebook_url: 'https://facebook.com/kaladesignco',
                        instagram_url: 'https://instagram.com/kaladesignco',
                        linkedin_url: 'https://linkedin.com/company/kaladesignco',
                        twitter_url: ''
                    };
                }
                throw error;
            }
            return data || {};
        } catch (error) {
            console.error('Error fetching site settings:', error);
            // Return default settings on any error
            return {
                phone: '+91 98765 43210',
                email: 'info@kaladesignco.com',
                address: 'Design District, New Delhi, India',
                facebook_url: 'https://facebook.com/kaladesignco',
                instagram_url: 'https://instagram.com/kaladesignco',
                linkedin_url: 'https://linkedin.com/company/kaladesignco',
                twitter_url: ''
            };
        }
    }

    async updateSiteSettings(settings) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const siteData = JSON.parse(localStorage.getItem('kala_site_data') || '{}');
            siteData.settings = { ...siteData.settings, ...settings };
            localStorage.setItem('kala_site_data', JSON.stringify(siteData));
            return settings;
        }

        try {
            const { data, error } = await this.supabase
                .from('site_settings')
                .upsert({
                    id: 1, // Single row for site settings
                    ...settings,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating site settings:', error);
            throw error;
        }
    }

    // SEO Settings Management
    async getSEOSettings() {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const siteData = JSON.parse(localStorage.getItem('kala_site_data') || '{}');
            return siteData.seo || {
                site_title: 'Kala Design Co - Interior Design Excellence',
                tagline: 'Transforming Spaces, Creating Dreams',
                meta_description: 'Professional interior design services in Delhi.',
                meta_keywords: 'interior design, home design, office design, delhi',
                google_analytics_id: '',
                google_search_console: '',
                facebook_pixel_id: ''
            };
        }

        try {
            const { data, error } = await this.supabase
                .from('seo_settings')
                .select('*')
                .single();

            if (error) {
                // Handle table not found or other errors
                if (error.code === 'PGRST116' || error.message.includes('406') || error.message.includes('Not Acceptable')) {
                    console.warn('SEO settings table not found, using defaults. Please run database setup.');
                    // Return default SEO settings if table doesn't exist
                    return {
                        site_title: 'Kala Design Co - Interior Design Excellence',
                        tagline: 'Transforming Spaces, Creating Dreams',
                        meta_description: 'Professional interior design services in Delhi.',
                        meta_keywords: 'interior design, home design, office design, delhi',
                        google_analytics_id: '',
                        google_search_console: '',
                        facebook_pixel_id: ''
                    };
                }
                throw error;
            }
            return data || {};
        } catch (error) {
            console.error('Error fetching SEO settings:', error);
            // Return default SEO settings on any error
            return {
                site_title: 'Kala Design Co - Interior Design Excellence',
                tagline: 'Transforming Spaces, Creating Dreams',
                meta_description: 'Professional interior design services in Delhi.',
                meta_keywords: 'interior design, home design, office design, delhi',
                google_analytics_id: '',
                google_search_console: '',
                facebook_pixel_id: ''
            };
        }
    }

    async updateSEOSettings(seoSettings) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const siteData = JSON.parse(localStorage.getItem('kala_site_data') || '{}');
            siteData.seo = { ...siteData.seo, ...seoSettings };
            localStorage.setItem('kala_site_data', JSON.stringify(siteData));
            return seoSettings;
        }

        try {
            const { data, error } = await this.supabase
                .from('seo_settings')
                .upsert({
                    id: 1, // Single row for SEO settings
                    ...seoSettings,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating SEO settings:', error);
            throw error;
        }
    }

    // Page Content Management
    async getPageContent(pageName) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const siteData = JSON.parse(localStorage.getItem('kala_site_data') || '{}');
            return siteData.pages?.[pageName] || {};
        }

        try {
            const { data, error } = await this.supabase
                .from('page_content')
                .select('*')
                .eq('page_name', pageName)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data || {};
        } catch (error) {
            console.error('Error fetching page content:', error);
            return {};
        }
    }

    async updatePageContent(pageName, content) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const siteData = JSON.parse(localStorage.getItem('kala_site_data') || '{}');
            if (!siteData.pages) siteData.pages = {};
            siteData.pages[pageName] = content;
            localStorage.setItem('kala_site_data', JSON.stringify(siteData));
            return content;
        }

        try {
            const { data, error } = await this.supabase
                .from('page_content')
                .upsert({
                    page_name: pageName,
                    ...content,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating page content:', error);
            throw error;
        }
    }

    // Analytics Data
    async logAnalyticsEvent(eventData) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            return; // Skip analytics logging for localStorage
        }

        try {
            const { error } = await this.supabase
                .from('analytics_events')
                .insert([{
                    event_name: eventData.eventName,
                    event_category: eventData.category,
                    event_label: eventData.label,
                    event_value: eventData.value,
                    page_url: window.location.href,
                    page_title: document.title,
                    user_agent: navigator.userAgent,
                    referrer: document.referrer || null
                }]);

            if (error) throw error;
        } catch (error) {
            console.error('Error logging analytics event:', error);
        }
    }

    async getAnalyticsData(days = 30) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            // Return mock data for localStorage
            return {
                pageViews: Math.floor(Math.random() * 10000) + 5000,
                visitors: Math.floor(Math.random() * 5000) + 2000,
                topPages: [
                    { page: 'Home', views: 3245 },
                    { page: 'Services', views: 1876 },
                    { page: 'Work', views: 1432 }
                ]
            };
        }

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await this.supabase
                .from('analytics_events')
                .select('*')
                .gte('created_at', startDate.toISOString());

            if (error) throw error;

            // Process analytics data
            const pageViews = data.filter(event => event.event_name === 'page_view').length;
            const uniqueVisitors = new Set(data.map(event => event.user_agent)).size;

            return {
                pageViews,
                visitors: uniqueVisitors,
                events: data
            };
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            return { pageViews: 0, visitors: 0, events: [] };
        }
    }

    // Image Management
    async uploadImage(file, folder = 'uploads') {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            // For localStorage, convert to base64
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        try {
            const fileName = `${folder}/${Date.now()}-${file.name}`;

            const { data, error } = await this.supabase.storage
                .from('images')
                .upload(fileName, file);

            if (error) throw error;

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async deleteImage(fileName) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            return true; // Can't delete base64 images
        }

        try {
            const { error } = await this.supabase.storage
                .from('images')
                .remove([fileName]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }

    // User Authentication (for admin panel)
    async signIn(email, password) {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            // Fallback authentication
            const validUsers = [
                { email: 'admin@kaladesignco.com', password: 'kala2024' },
                { email: 'demo@kaladesignco.com', password: 'demo123' }
            ];

            const user = validUsers.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('kala_admin_logged_in', 'true');
                localStorage.setItem('kala_admin_login_time', Date.now().toString());
                return { user: { email: user.email }, error: null };
            } else {
                return { user: null, error: { message: 'Invalid credentials' } };
            }
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            return { user: data.user, error };
        } catch (error) {
            console.error('Error signing in:', error);
            return { user: null, error };
        }
    }

    async signOut() {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            localStorage.removeItem('kala_admin_logged_in');
            localStorage.removeItem('kala_admin_login_time');
            return { error: null };
        }

        try {
            const { error } = await this.supabase.auth.signOut();
            return { error };
        } catch (error) {
            console.error('Error signing out:', error);
            return { error };
        }
    }

    async getCurrentUser() {
        if (!this.isInitialized || this.fallbackToLocalStorage) {
            const loggedIn = localStorage.getItem('kala_admin_logged_in');
            const loginTime = localStorage.getItem('kala_admin_login_time');

            if (loggedIn && loginTime) {
                const twentyFourHours = 24 * 60 * 60 * 1000;
                const now = Date.now();
                const loginTimestamp = parseInt(loginTime);

                if (now - loginTimestamp < twentyFourHours) {
                    return { user: { email: 'admin@kaladesignco.com' }, error: null };
                }
            }
            return { user: null, error: null };
        }

        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            return { user, error };
        } catch (error) {
            console.error('Error getting current user:', error);
            return { user: null, error };
        }
    }
}

// Export singleton instance
const databaseService = new DatabaseService();
window.databaseService = databaseService;