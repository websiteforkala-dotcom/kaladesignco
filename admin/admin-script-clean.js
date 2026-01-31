// Admin Panel JavaScript - Clean Version
console.log('Loading AdminPanel class...');

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.db = null;
        this.contactForms = [];
        this.siteData = {};
        this.pageContent = {};
        this.seoSettings = {};
        this.siteSettings = {};
        this.init();
    }

    async init() {
        // Wait for database service to initialize
        await this.waitForDatabase();
        
        this.setupNavigation();
        this.setupPageEditor();
        this.setupContactForms();
        this.setupSettings();
        this.setupSEO();
        this.setupAnalytics();
        this.setupImageUpload();
        await this.loadDashboard();
        
        // Load all data initially
        await this.loadAllData();
    }

    async waitForDatabase() {
        return new Promise((resolve) => {
            const checkDB = () => {
                if (window.databaseService && window.databaseService.isInitialized) {
                    this.db = window.databaseService;
                    resolve();
                } else {
                    setTimeout(checkDB, 100);
                }
            };
            checkDB();
        });
    }

    // Load all data from database
    async loadAllData() {
        try {
            // Load all data in parallel
            const [contactForms, siteSettings, seoSettings, pageContent] = await Promise.all([
                this.db.getContactForms(),
                this.db.getSiteSettings(),
                this.db.getSEOSettings(),
                this.loadAllPageContent()
            ]);

            this.contactForms = contactForms;
            this.siteSettings = siteSettings;
            this.seoSettings = seoSettings;
            this.pageContent = pageContent;

            // Update UI with loaded data
            this.updateDashboardStats();
            this.populateSettingsForm();
            this.populateSEOForm();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Error loading data from database', 'error');
        }
    }

    async loadAllPageContent() {
        const pages = ['index.html', 'about.html', 'services.html', 'work.html', 'contact.html'];
        const pageContent = {};
        
        for (const page of pages) {
            try {
                pageContent[page] = await this.db.getPageContent(page);
            } catch (error) {
                console.error(`Error loading ${page}:`, error);
                pageContent[page] = {};
            }
        }
        
        return pageContent;
    }

    // Navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                
                // Update active nav
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Update page title
                const title = link.textContent.trim();
                document.getElementById('page-title').textContent = title;
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        document.getElementById(sectionId).classList.add('active');
        this.currentSection = sectionId;
        
        // Load section-specific data
        if (sectionId === 'dashboard') {
            this.loadDashboard();
        } else if (sectionId === 'contact-data') {
            this.loadContactTable();
        } else if (sectionId === 'analytics') {
            this.loadAnalytics();
        }
    }

    // Dashboard
    async loadDashboard() {
        try {
            await this.loadAllData();
            this.updateDashboardStats();
            this.loadRecentActivity();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showMessage('Error loading dashboard data', 'error');
        }
    }

    updateDashboardStats() {
        // Update contact forms count
        document.getElementById('contact-count').textContent = this.contactForms.length;
        
        // Update new contacts (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newContacts = this.contactForms.filter(contact => 
            new Date(contact.created_at) > weekAgo
        ).length;
        
        // Update analytics data
        this.db.getAnalyticsData().then(analyticsData => {
            document.getElementById('page-views').textContent = analyticsData.pageViews.toLocaleString();
            document.getElementById('visitors').textContent = analyticsData.visitors.toLocaleString();
        });
        
        // Update last updated
        const lastUpdated = new Date().toLocaleDateString();
        document.getElementById('last-updated').textContent = lastUpdated;
    }

    loadRecentActivity() {
        const activityList = document.getElementById('activity-list');
        const activities = [];
        
        // Add recent contact forms
        this.contactForms.slice(0, 3).forEach(contact => {
            activities.push({
                type: 'contact',
                message: `New contact from ${contact.name}`,
                time: this.formatTimeAgo(contact.created_at),
                icon: 'fas fa-envelope'
            });
        });
        
        // Add other activities
        activities.push({
            type: 'edit',
            message: 'Site settings updated',
            time: '1 day ago',
            icon: 'fas fa-cog'
        });

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background-color: rgba(37, 99, 235, 0.1); color: var(--admin-primary);">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        return date.toLocaleDateString();
    }

    // Placeholder methods for other functionality
    setupPageEditor() {
        console.log('Page editor setup');
    }

    setupContactForms() {
        console.log('Contact forms setup');
    }

    setupSettings() {
        console.log('Settings setup');
    }

    setupSEO() {
        console.log('SEO setup');
    }

    setupAnalytics() {
        console.log('Analytics setup');
    }

    setupImageUpload() {
        console.log('Image upload setup');
    }

    loadContactTable() {
        console.log('Loading contact table');
    }

    loadAnalytics() {
        console.log('Loading analytics');
    }

    populateSettingsForm() {
        console.log('Populating settings form');
    }

    populateSEOForm() {
        console.log('Populating SEO form');
    }

    // Utility
    showMessage(message, type = 'success') {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

console.log('AdminPanel class defined successfully');

// Make AdminPanel available globally immediately
window.AdminPanel = AdminPanel;
console.log('AdminPanel assigned to window object');

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, AdminPanel available:', !!window.AdminPanel);
    
    // Simple initialization without authentication checks
    try {
        window.adminPanel = new AdminPanel();
        console.log('AdminPanel initialized successfully');
    } catch (error) {
        console.error('Error initializing AdminPanel:', error);
    }
});

console.log('Admin script loaded successfully');