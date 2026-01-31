// Google Analytics Integration
class AnalyticsIntegration {
    constructor() {
        this.analyticsId = this.getAnalyticsId();
        this.init();
    }

    init() {
        if (this.analyticsId) {
            this.loadGoogleAnalytics();
            this.setupEventTracking();
        }
        
        // Check for updates to analytics ID
        this.watchForUpdates();
    }

    getAnalyticsId() {
        // Get from admin settings
        const siteData = JSON.parse(localStorage.getItem('kala_site_data') || '{}');
        return siteData.seo?.analyticsId || '';
    }

    loadGoogleAnalytics() {
        // Load Google Analytics 4
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.analyticsId}`;
        document.head.appendChild(script1);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', this.analyticsId, {
            page_title: document.title,
            page_location: window.location.href
        });

        // Make gtag globally available
        window.gtag = gtag;

        console.log('Google Analytics loaded with ID:', this.analyticsId);
    }

    setupEventTracking() {
        // Track page views
        this.trackPageView();
        
        // Track button clicks
        this.trackButtonClicks();
        
        // Track form submissions
        this.trackFormSubmissions();
        
        // Track scroll depth
        this.trackScrollDepth();
        
        // Track file downloads
        this.trackDownloads();
        
        // Track external links
        this.trackExternalLinks();
    }

    trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }

        // Log to database
        if (window.databaseService) {
            window.databaseService.logAnalyticsEvent({
                eventName: 'page_view',
                category: 'Navigation',
                label: document.title,
                value: 1
            });
        }
    }

    trackButtonClicks() {
        // Track CTA buttons
        const ctaButtons = document.querySelectorAll('.btn-primary, .cta-button, [data-track="cta"]');
        ctaButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'CTA',
                        event_label: button.textContent.trim() || button.getAttribute('aria-label') || 'CTA Button'
                    });
                }
            });
        });

        // Track navigation clicks
        const navLinks = document.querySelectorAll('nav a, .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'Navigation',
                        event_label: link.textContent.trim() || link.href
                    });
                }
            });
        });
    }

    trackFormSubmissions() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                if (typeof gtag !== 'undefined') {
                    const formName = form.getAttribute('name') || 
                                   form.getAttribute('id') || 
                                   'Contact Form';
                    
                    gtag('event', 'form_submit', {
                        event_category: 'Form',
                        event_label: formName
                    });
                }
            });
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 100];
        const tracked = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                milestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !tracked.has(milestone)) {
                        tracked.add(milestone);
                        
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'scroll', {
                                event_category: 'Engagement',
                                event_label: `${milestone}% Scroll Depth`,
                                value: milestone
                            });
                        }
                    }
                });
            }
        });
    }

    trackDownloads() {
        const downloadLinks = document.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".zip"], a[download]');
        
        downloadLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag !== 'undefined') {
                    const fileName = link.getAttribute('download') || 
                                   link.href.split('/').pop() || 
                                   'Unknown File';
                    
                    gtag('event', 'file_download', {
                        event_category: 'Download',
                        event_label: fileName,
                        value: 1
                    });
                }
            });
        });
    }

    trackExternalLinks() {
        const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
        
        externalLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'External Link',
                        event_label: link.href,
                        transport_type: 'beacon'
                    });
                }
            });
        });
    }

    // Custom event tracking methods
    trackCustomEvent(eventName, category, label, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    }

    trackTiming(category, variable, value, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
                name: variable,
                value: value,
                event_category: category,
                event_label: label
            });
        }
    }

    trackException(description, fatal = false) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: description,
                fatal: fatal
            });
        }
    }

    // Watch for analytics ID updates from admin panel
    watchForUpdates() {
        // Check for updates every 30 seconds
        setInterval(() => {
            const newAnalyticsId = this.getAnalyticsId();
            if (newAnalyticsId && newAnalyticsId !== this.analyticsId) {
                this.analyticsId = newAnalyticsId;
                this.loadGoogleAnalytics();
                console.log('Analytics ID updated:', newAnalyticsId);
            }
        }, 30000);
    }

    // Performance tracking
    trackPageLoadTime() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'timing_complete', {
                        name: 'page_load_time',
                        value: pageLoadTime,
                        event_category: 'Performance'
                    });
                }
            }, 0);
        });
    }

    // Enhanced ecommerce tracking (for future use)
    trackPurchase(transactionId, items, value, currency = 'USD') {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'purchase', {
                transaction_id: transactionId,
                value: value,
                currency: currency,
                items: items
            });
        }
    }

    trackViewItem(itemId, itemName, category, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_item', {
                currency: 'USD',
                value: value,
                items: [{
                    item_id: itemId,
                    item_name: itemName,
                    item_category: category,
                    quantity: 1,
                    price: value
                }]
            });
        }
    }
}

// Initialize analytics
const analytics = new AnalyticsIntegration();

// Make available globally for custom tracking
window.analytics = analytics;

// Track page load time
analytics.trackPageLoadTime();

// Error tracking
window.addEventListener('error', (e) => {
    analytics.trackException(`${e.message} at ${e.filename}:${e.lineno}:${e.colno}`);
});

// Unhandled promise rejection tracking
window.addEventListener('unhandledrejection', (e) => {
    analytics.trackException(`Unhandled promise rejection: ${e.reason}`);
});