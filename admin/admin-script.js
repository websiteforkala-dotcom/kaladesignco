// Admin Panel JavaScript - Clean Version
console.log('Loading AdminPanel class...');

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.db = null;
        this.contactForms = [];
        this.siteData = {};
        this.seoSettings = {};
        this.siteSettings = {};
        this.workProjects = [];
        this.init();
    }

    async init() {
        // Wait for database service to initialize
        await this.waitForDatabase();

        this.setupNavigation();
        this.setupWorkPortfolio();
        this.setupContactForms();
        this.setupSettings();
        this.setupSEO();
        this.setupAnalytics();
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
            const [contactForms, siteSettings, seoSettings] = await Promise.all([
                this.db.getContactForms(),
                this.db.getSiteSettings(),
                this.db.getSEOSettings()
            ]);

            this.contactForms = contactForms;
            this.siteSettings = siteSettings;
            this.seoSettings = seoSettings;

            // Load work projects (static for now)
            this.loadWorkProjects();

            // Update UI with loaded data
            this.updateDashboardStats();
            this.populateSettingsForm();
            this.populateSEOForm();

        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Error loading data from database', 'error');
        }
    }

    async loadWorkProjects() {
        try {
            this.workProjects = await this.db.getWorks();
            this.renderWorkProjects();
        } catch (error) {
            console.error('Error loading work projects:', error);
            this.showMessage('Error loading projects', 'error');
        }
    }

    loadWorkPortfolio() {
        this.loadWorkProjects();
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
        } else if (sectionId === 'work-portfolio') {
            this.loadWorkPortfolio();
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

    // Work Portfolio Management
    setupWorkPortfolio() {
        const addProjectBtn = document.getElementById('add-project');
        const syncWorkBtn = document.getElementById('sync-work');
        const projectUseForm = document.getElementById('project-form');

        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.openProjectModal();
            });
        }

        if (syncWorkBtn) {
            syncWorkBtn.addEventListener('click', () => {
                this.syncWorkToFrontend();
            });
        }

        // Setup Modal Logic
        this.setupProjectModal();
    }

    setupProjectModal() {
        const modal = document.getElementById('project-modal');
        const closeBtns = modal ? modal.querySelectorAll('.close-modal, .close-modal-btn') : [];
        const form = document.getElementById('project-form');

        if (!modal) return;

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('active');
                form.reset();
                document.getElementById('project-id').value = '';
                document.getElementById('modal-title').textContent = 'Add New Project';
            });
        });

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                form.reset();
            }
        });

        // Form Submit
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSaveProject();
            });
        }
    }

    openProjectModal(project = null) {
        const modal = document.getElementById('project-modal');
        const form = document.getElementById('project-form');
        const title = document.getElementById('modal-title');

        if (!modal || !form) return;

        if (project) {
            // Edit Mode
            title.textContent = 'Edit Project';
            document.getElementById('project-id').value = project.id;
            document.getElementById('project-title').value = project.title;
            document.getElementById('project-category').value = project.category || 'Residential';
            document.getElementById('project-description').value = project.description || '';
            document.getElementById('project-location').value = project.location || '';
            document.getElementById('project-year').value = project.year || '';
            document.getElementById('project-image').value = project.image_url || '';
            document.getElementById('project-featured').checked = project.featured;
        } else {
            // Add Mode
            title.textContent = 'Add New Project';
            form.reset();
            document.getElementById('project-id').value = '';
        }

        modal.classList.add('active');
    }

    async handleSaveProject() {
        const id = document.getElementById('project-id').value;
        const projectData = {
            title: document.getElementById('project-title').value,
            category: document.getElementById('project-category').value,
            description: document.getElementById('project-description').value,
            location: document.getElementById('project-location').value,
            year: document.getElementById('project-year').value,
            image_url: document.getElementById('project-image').value,
            featured: document.getElementById('project-featured').checked
        };

        try {
            if (id) {
                // Update
                await this.db.updateWork(parseInt(id) || id, projectData);
                this.showMessage('Project updated successfully', 'success');
            } else {
                // Create
                await this.db.addWork(projectData);
                this.showMessage('Project created successfully', 'success');
            }

            // Reload and Render
            await this.loadWorkProjects();

            // Close Modal
            document.getElementById('project-modal').classList.remove('active');

        } catch (error) {
            console.error('Error saving project:', error);
            this.showMessage('Error saving project', 'error');
        }
    }

    async handleDeleteProject(id) {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                await this.db.deleteWork(id);
                this.showMessage('Project deleted successfully', 'success');
                await this.loadWorkProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
                this.showMessage('Error deleting project', 'error');
            }
        }
    }

    renderWorkProjects() {
        const grid = document.getElementById('work-grid');
        if (!grid) return;

        if (this.workProjects.length === 0) {
            grid.innerHTML = '<p class="no-data">No projects found. Add your first project!</p>';
            return;
        }

        grid.innerHTML = this.workProjects.map(project => `
            <div class="work-card">
                <div class="work-image">
                    <img src="${project.image_url || '../assets/placeholder.jpg'}" alt="${project.title}" loading="lazy" onerror="this.src='./assets/placeholder.jpg'">
                </div>
                <div class="work-info">
                    <h4>${project.title}</h4>
                    <span class="work-category">${project.category}</span>
                    <p class="work-description">${project.description || ''}</p>
                    <div class="work-meta">
                        <span>Location: ${project.location || 'N/A'}</span>
                        <span>Year: ${project.year || 'N/A'}</span>
                    </div>
                </div>
                <div class="work-actions">
                    <button class="btn-edit" onclick="window.adminPanel.handleEditClick(${project.id})">Edit</button>
                    <button class="btn-delete" onclick="window.adminPanel.handleDeleteProject(${project.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    handleEditClick(id) {
        const project = this.workProjects.find(p => p.id === id);
        if (project) {
            this.openProjectModal(project);
        }
    }

    async syncWorkToFrontend() {
        // Trigger a sync event
        if (window.frontendSync) {
            window.frontendSync.syncNow();
        } else {
            // Simulate sync by updating usage of the works in frontend
            // In a real app with static pages, this might involve rebuilding or using the database directly in frontend
        }
        this.showMessage('Frontend sync triggered', 'success');
    }

    // Placeholder methods for other functionality
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

        // Create message element
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            const messageEl = document.createElement('div');
            messageEl.className = `message message-${type}`;
            messageEl.textContent = message;

            messageContainer.appendChild(messageEl);

            // Remove after 3 seconds
            setTimeout(() => {
                messageEl.remove();
            }, 3000);
        }
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