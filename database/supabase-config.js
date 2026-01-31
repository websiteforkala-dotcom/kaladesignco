// Supabase Configuration
class SupabaseConfig {
    constructor() {
        // 🔧 CONFIGURATION REQUIRED
        // Replace these with your actual Supabase project credentials
        // Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

        this.supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
        this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

        // ✅ CLI Access Token (already configured)
        this.accessToken = 'YOUR_SUPABASE_ACCESS_TOKEN';

        // 🚀 Quick Setup Instructions:
        // 1. Run: node scripts/get-project-info.js list
        // 2. Copy your project URL and anon key
        // 3. Replace the values above
        // 4. Open database/config-checker.html to test

        this.supabase = null;
        this.init();
    }

    async init() {
        try {
            // Check if we have real credentials
            if (this.supabaseUrl.includes('your-project-ref') ||
                this.supabaseKey.includes('your-anon-key')) {
                console.log('⚠️ Supabase not configured - using localStorage fallback');
                console.log('📋 To configure: update database/supabase-config.js with your project credentials');
                console.log('🔧 Get credentials from: https://supabase.com/dashboard');
                return null;
            }

            // Load Supabase client
            if (typeof window !== 'undefined' && !window.supabase) {
                // Load Supabase from CDN
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                document.head.appendChild(script);

                await new Promise((resolve) => {
                    script.onload = resolve;
                });
            }

            // Initialize Supabase client
            this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('✅ Supabase initialized successfully');
            console.log('🔗 Connected to:', this.supabaseUrl);

            return this.supabase;
        } catch (error) {
            console.error('❌ Error initializing Supabase:', error);
            console.log('🔄 Falling back to localStorage');
            throw error;
        }
    }

    getClient() {
        return this.supabase;
    }

    // Test connection
    async testConnection() {
        try {
            if (!this.supabase) {
                console.log('⚠️ Supabase not initialized - check configuration');
                return false;
            }

            const { data, error } = await this.supabase
                .from('contact_forms')
                .select('count', { count: 'exact', head: true });

            if (error) throw error;
            console.log('✅ Supabase connection test successful');
            return true;
        } catch (error) {
            console.error('❌ Supabase connection test failed:', error);
            return false;
        }
    }

    // Get project info using CLI token
    async getProjectInfo() {
        try {
            const response = await fetch('https://api.supabase.com/v1/projects', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const projects = await response.json();
            console.log('📊 Available projects:', projects);
            return projects;
        } catch (error) {
            console.error('❌ Error fetching project info:', error);
            return null;
        }
    }

    // Helper method to check if properly configured
    isConfigured() {
        return !this.supabaseUrl.includes('your-project-ref') &&
            !this.supabaseKey.includes('your-anon-key') &&
            this.supabase !== null;
    }

    // Get configuration status
    getStatus() {
        if (this.isConfigured()) {
            return {
                status: 'configured',
                message: 'Supabase is properly configured and connected',
                url: this.supabaseUrl
            };
        } else {
            return {
                status: 'needs_config',
                message: 'Supabase configuration required',
                instructions: [
                    '1. Run: node scripts/get-project-info.js list',
                    '2. Update supabaseUrl and supabaseKey in this file',
                    '3. Test with database/config-checker.html'
                ]
            };
        }
    }
}

// Export singleton instance
const supabaseConfig = new SupabaseConfig();
window.supabaseConfig = supabaseConfig;