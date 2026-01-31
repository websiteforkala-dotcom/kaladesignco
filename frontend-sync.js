// Frontend Data Synchronization
// This script syncs data from the database to the frontend in real-time

class FrontendSync {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.syncInterval = null;
        this.init();
    }

    async init() {
        // Wait for database service
        await this.waitForDatabase();

        // Load initial data
        await this.loadAllFrontendData();

        // Setup periodic sync
        this.setupPeriodicSync();

        // Setup page-specific updates
        this.setupPageSpecificUpdates();

        console.log('Frontend sync initialized');
    }

    async waitForDatabase() {
        return new Promise((resolve) => {
            const checkDB = () => {
                if (window.databaseService && window.databaseService.isInitialized) {
                    this.db = window.databaseService;
                    this.isInitialized = true;
                    resolve();
                } else {
                    setTimeout(checkDB, 100);
                }
            };
            checkDB();
        });
    }

    async loadAllFrontendData() {
        try {
            // Load all data in parallel
            // Load all data in parallel
            const [siteSettings, seoSettings, pageContent, works] = await Promise.all([
                this.db.getSiteSettings(),
                this.db.getSEOSettings(),
                this.getCurrentPageContent(),
                this.db.getWorks()
            ]);

            // Update frontend with loaded data
            this.updateSiteSettings(siteSettings);
            this.updateSEOSettings(seoSettings);
            this.updatePageContent(pageContent);
            this.updateWorks(works);

            // Handle Work Detail Page
            if (window.location.pathname.includes('work-detail.html')) {
                await this.updateWorkDetail(works);
            }

        } catch (error) {
            console.error('Error loading frontend data:', error);
        }
    }

    async getCurrentPageContent() {
        const currentPage = this.getCurrentPageName();
        if (currentPage) {
            return await this.db.getPageContent(currentPage);
        }
        return {};
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();

        // Default to index.html if no filename or root
        if (!filename || filename === '' || path === '/') {
            return 'index.html';
        }

        // Add .html extension if missing
        if (!filename.includes('.')) {
            return filename + '.html';
        }

        return filename;
    }

    updateSiteSettings(settings) {
        if (!settings) return;

        // Update contact information
        this.updateElements('.contact-phone, [data-contact="phone"]', settings.phone);
        this.updateElements('.contact-email, [data-contact="email"]', settings.email, 'email');
        this.updateElements('.contact-address, [data-contact="address"]', settings.address);

        // Update social media links
        this.updateSocialLinks('facebook', settings.facebook_url);
        this.updateSocialLinks('instagram', settings.instagram_url);
        this.updateSocialLinks('linkedin', settings.linkedin_url);
        this.updateSocialLinks('twitter', settings.twitter_url);

        // Update business hours if exists
        if (settings.business_hours) {
            this.updateBusinessHours(settings.business_hours);
        }
    }

    updateElements(selector, value, type = 'text') {
        if (!value) return;

        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (type === 'email' && element.tagName === 'A') {
                element.href = `mailto:${value}`;
                element.textContent = value;
            } else if (type === 'phone' && element.tagName === 'A') {
                element.href = `tel:${value}`;
                element.textContent = value;
            } else {
                element.textContent = value;
            }
        });
    }

    updateSocialLinks(platform, url) {
        const selectors = [
            `[data-social="${platform}"]`,
            `.social-${platform}`,
            `[href*="${platform}"]`
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (url) {
                    element.href = url;
                    element.style.display = '';
                    element.setAttribute('target', '_blank');
                    element.setAttribute('rel', 'noopener noreferrer');
                } else {
                    element.style.display = 'none';
                }
            });
        });
    }

    updateBusinessHours(hours) {
        const hoursElement = document.querySelector('.business-hours, [data-business-hours]');
        if (hoursElement && typeof hours === 'object') {
            // Format business hours for display
            const formattedHours = Object.entries(hours)
                .map(([day, time]) => `${day}: ${time}`)
                .join('<br>');
            hoursElement.innerHTML = formattedHours;
        }
    }

    updateSEOSettings(settings) {
        if (!settings) return;

        // Update page title
        if (settings.site_title) {
            document.title = settings.site_title;
        }

        // Update meta description
        this.updateMetaTag('description', settings.meta_description);

        // Update meta keywords
        this.updateMetaTag('keywords', settings.meta_keywords);

        // Update Open Graph tags
        this.updateMetaTag('og:title', settings.site_title, 'property');
        this.updateMetaTag('og:description', settings.meta_description, 'property');

        // Load Google Analytics if ID is provided
        if (settings.google_analytics_id) {
            this.loadGoogleAnalytics(settings.google_analytics_id);
        }

        // Load Facebook Pixel if ID is provided
        if (settings.facebook_pixel_id) {
            this.loadFacebookPixel(settings.facebook_pixel_id);
        }
    }

    updateMetaTag(name, content, attribute = 'name') {
        if (!content) return;

        let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute(attribute, name);
            document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
    }

    updatePageContent(content) {
        if (!content) return;

        // Update hero section
        if (content.hero_text) {
            const heroElements = document.querySelectorAll('.hero h1, .hero-title, .main-title, h1');
            heroElements.forEach(element => {
                if (element.closest('.hero') || element.classList.contains('hero-title')) {
                    element.textContent = content.hero_text;
                }
            });
        }

        // Update page title in content
        if (content.title) {
            const titleElements = document.querySelectorAll('.page-title, [data-page-title]');
            titleElements.forEach(element => {
                element.textContent = content.title;
            });
        }

        // Update page description
        if (content.description) {
            const descElements = document.querySelectorAll('.page-description, [data-page-description]');
            descElements.forEach(element => {
                element.textContent = content.description;
            });
        }

        // Update main content if exists
        if (content.main_content) {
            const contentElements = document.querySelectorAll('.main-content, [data-main-content]');
            contentElements.forEach(element => {
                element.innerHTML = content.main_content;
            });
        }

        // Update page-specific meta tags
        if (content.meta_title) {
            document.title = content.meta_title;
        }

        if (content.meta_description) {
            this.updateMetaTag('description', content.meta_description);
        }

        if (content.meta_keywords) {
            this.updateMetaTag('keywords', content.meta_keywords);
        }
    }

    updateWorks(works) {
        if (!works) return;

        console.log('Syncing works:', works.length, 'projects found');

        // 1. Update Homepage Horizontal Scroll
        const scrollTrack = document.querySelector('#worksScroll .horizontal-scroll-track');
        if (scrollTrack) {
            // Check if we should replace (only if we have valid work items)
            if (works.length > 0) {
                scrollTrack.innerHTML = works.map((work, index) => `
                    <a href="work-detail.html?id=${work.id}" class="scroll-card">
                        <div class="scroll-card-img">
                            <img src="${work.image_url || './assets/placeholder.jpg'}" alt="${work.title}" loading="lazy" onerror="this.src='./assets/placeholder.jpg'">
                        </div>
                        <div class="scroll-card-info">
                            <span class="scroll-card-num">${String(index + 1).padStart(2, '0')}</span>
                            <h3>${work.title}</h3>
                            <span class="scroll-card-cat">${work.category}</span>
                        </div>
                    </a>
                `).join('');
            } else {
                console.log('No works in database, keeping static content.');
            }
        }

        // 2. Update Work Page Grid
        const workGrid = document.querySelector('.work-grid-container, .works-grid'); // Adjust selector based on work.html
        if (workGrid) {
            workGrid.innerHTML = works.map(work => `
                <div class="work-item">
                    <a href="work-detail.html?id=${work.id}" class="work-link">
                        <div class="work-img">
                            <img src="${work.image_url || './assets/placeholder.jpg'}" alt="${work.title}" loading="lazy">
                        </div>
                        <div class="work-content">
                            <h3>${work.title}</h3>
                            <span class="category">${work.category}</span>
                        </div>
                    </a>
                </div>
            `).join('');
        }
    }

    loadGoogleAnalytics(trackingId) {
        // Check if already loaded
        if (window.gtag || document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${trackingId}"]`)) {
            return;
        }

        // Load Google Analytics
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}');
        `;
        document.head.appendChild(script2);

        console.log('Google Analytics loaded:', trackingId);
    }

    loadFacebookPixel(pixelId) {
        // Check if already loaded
        if (window.fbq || document.querySelector(`script[src*="connect.facebook.net"]`)) {
            return;
        }

        // Load Facebook Pixel
        const script = document.createElement('script');
        script.textContent = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
        `;
        document.head.appendChild(script);

        console.log('Facebook Pixel loaded:', pixelId);
    }

    setupPeriodicSync() {
        // Sync data every 5 minutes
        this.syncInterval = setInterval(() => {
            this.loadAllFrontendData();
        }, 5 * 60 * 1000);
    }

    setupPageSpecificUpdates() {
        // Listen for admin panel updates via localStorage events
        window.addEventListener('storage', (e) => {
            if (e.key === 'kala_admin_update') {
                const updateData = JSON.parse(e.newValue || '{}');
                this.handleAdminUpdate(updateData);
            }
        });

        // Listen for custom events from admin panel
        window.addEventListener('kala-admin-update', (e) => {
            this.handleAdminUpdate(e.detail);
        });
    }

    handleAdminUpdate(updateData) {
        switch (updateData.type) {
            case 'site_settings':
                this.updateSiteSettings(updateData.data);
                break;
            case 'seo_settings':
                this.updateSEOSettings(updateData.data);
                break;
            case 'page_content':
                if (updateData.page === this.getCurrentPageName()) {
                    this.updatePageContent(updateData.data);
                }
                break;
        }
    }

    // Manual sync method for immediate updates
    async syncNow() {
        await this.loadAllFrontendData();
        console.log('Frontend data synced manually');
    }

    // Cleanup method
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        window.removeEventListener('storage', this.handleAdminUpdate);
        window.removeEventListener('kala-admin-update', this.handleAdminUpdate);
    }

    async updateWorkDetail(works) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (!id) return;

        // Find work in loaded works or fetch if needed
        let work = works ? works.find(w => w.id.toString() === id.toString()) : null;

        if (!work) {
            try {
                // Fetch specific work if not in list
                const { data, error } = await this.db.supabase
                    .from('works')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) work = data;
            } catch (e) {
                console.error('Error fetching work detail:', e);
            }
        }

        if (work) {
            // Update Page Title
            document.title = `${work.title} - Kala Design Co`;

            // Hero Section
            const heroTitle = document.querySelector('.project-title');
            const heroCat = document.querySelector('.project-category');
            const heroImg = document.querySelector('.project-hero-image img');
            const heroTagline = document.querySelector('.project-tagline'); // We might use description or custom field

            if (heroTitle) heroTitle.textContent = work.title;
            if (heroCat) heroCat.textContent = work.category;
            if (heroImg) {
                heroImg.src = work.image_url || './assets/placeholder.jpg';
                heroImg.alt = work.title;
            }
            if (heroTagline) heroTagline.textContent = work.description ? work.description.substring(0, 100) + '...' : '';

            // Info Grid
            const infoItems = document.querySelectorAll('.info-value');
            if (infoItems.length >= 2) {
                if (work.location) infoItems[0].textContent = work.location; // Location
                if (work.year) infoItems[1].textContent = work.year; // Year
            }

            // Description
            const descTitle = document.querySelector('.description-left h2'); // Keep "About the Project"
            const descText = document.querySelector('.description-right');
            if (descText) {
                descText.innerHTML = `<p>${work.description || 'No description available.'}</p>`;
            }
        }
    }

    // Track page views for analytics
    trackPageView() {
        if (this.db) {
            this.db.logAnalyticsEvent({
                eventName: 'page_view',
                category: 'Navigation',
                label: this.getCurrentPageName(),
                value: 1
            });
        }

        // Track with Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }

        // Track with Facebook Pixel if available
        if (typeof fbq !== 'undefined') {
            fbq('track', 'PageView');
        }
    }

    // Track custom events
    trackEvent(eventName, category = 'General', label = '', value = 1) {
        if (this.db) {
            this.db.logAnalyticsEvent({
                eventName,
                category,
                label,
                value
            });
        }

        // Track with Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    }
}

// Initialize frontend sync when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.frontendSync = new FrontendSync();

    // Track initial page view
    setTimeout(() => {
        if (window.frontendSync) {
            window.frontendSync.trackPageView();
        }
    }, 1000);
});

// Track page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.frontendSync) {
        // Sync data when page becomes visible
        window.frontendSync.syncNow();
    }
});

// Export for global access
window.FrontendSync = FrontendSync;