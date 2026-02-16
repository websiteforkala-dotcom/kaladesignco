// Admin Panel JavaScript with Full CRUD Operations

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
        const page