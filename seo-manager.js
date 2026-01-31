// SEO Manager
class SEOManager {
    constructor() {
        this.siteData = {};
        this.init();
    }

    async init() {
        this.siteData = await this.loadSiteData();
        this.updateMetaTags();
        this.addStructuredData();
        this.setupOpenGraph();
        this.setupTwitterCards();
        this.addCanonicalURL();
        this.setupGoogleSearchConsole();
        this.optimizeImages();
        this.watchForUpdates();
    }

    async loadSiteData() {
        const defaultData = {
            seo: {
                site_title: 'Kala Design Co - Interior Design Studio',
                tagline: 'Creating Beautiful Spaces',
                keywords: 'interior design, architecture, home design, commercial design, delhi, india',
                analytics_id: '',
                search_console: ''
            },
            settings: {
                phone: '',
                email: '',
                address: ''
            }
        };
        
        // Try to load from database first
        if (window.databaseService) {
            try {
                const seoSettings = await window.databaseService.getSEOSettings();
                const siteSettings = await window.databaseService.getSiteSettings();
                
                return {
                    seo: { ...defaultData.seo, ...seoSettings },
                    settings: { ...defaultData.settings, ...siteSettings }
                };
            } catch (error) {
                console.error('Error loading site data from database:', error);
            }
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('kala_site_data');
        return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    }

    updateMetaTags() {
        const currentPage = this.getCurrentPageInfo();
        
        // Update title
        document.title = currentPage.title || this.siteData.seo.siteTitle;
        
        // Update or create meta description
        this.updateMetaTag('description', currentPage.description || currentPage.defaultDescription);
        
        // Update or create meta keywords
        this.updateMetaTag('keywords', this.siteData.seo.keywords);
        
        // Add viewport meta tag if not present
        if (!document.querySelector('meta[name="viewport"]')) {
            this.createMetaTag('viewport', 'width=device-width, initial-scale=1.0');
        }
        
        // Add charset if not present
        if (!document.querySelector('meta[charset]')) {
            const charset = document.createElement('meta');
            charset.setAttribute('charset', 'UTF-8');
            document.head.insertBefore(charset, document.head.firstChild);
        }
        
        // Add robots meta tag
        this.updateMetaTag('robots', 'index, follow');
        
        // Add author
        this.updateMetaTag('author', 'Kala Design Co');
        
        // Add language
        if (!document.documentElement.getAttribute('lang')) {
            document.documentElement.setAttribute('lang', 'en');
        }
    }

    getCurrentPageInfo() {
        const path = window.location.pathname;
        const pages = {
            '/': {
                title: 'Kala Design Co - Premier Interior Design Studio in Delhi',
                description: 'Transform your space with Kala Design Co. Award-winning interior designers specializing in residential and commercial projects in Delhi, India.',
                defaultDescription: 'Premier interior design studio creating beautiful, functional spaces for homes and businesses.'
            },
            '/index.html': {
                title: 'Kala Design Co - Premier Interior Design Studio in Delhi',
                description: 'Transform your space with Kala Design Co. Award-winning interior designers specializing in residential and commercial projects in Delhi, India.',
                defaultDescription: 'Premier interior design studio creating beautiful, functional spaces for homes and businesses.'
            },
            '/about.html': {
                title: 'About Us - Kala Design Co Interior Designers',
                description: 'Learn about Kala Design Co\'s team of expert interior designers, our design philosophy, and our commitment to creating exceptional spaces.',
                defaultDescription: 'Meet our team of expert interior designers and learn about our design philosophy.'
            },
            '/services.html': {
                title: 'Interior Design Services - Residential & Commercial | Kala Design Co',
                description: 'Comprehensive interior design services including residential design, commercial spaces, renovation, and custom furniture. Professional design solutions in Delhi.',
                defaultDescription: 'Comprehensive interior design services for residential and commercial spaces.'
            },
            '/work.html': {
                title: 'Our Portfolio - Interior Design Projects | Kala Design Co',
                description: 'Explore our portfolio of stunning interior design projects. From luxury residences to modern offices, see our award-winning work.',
                defaultDescription: 'Explore our portfolio of stunning interior design projects and transformations.'
            },
            '/contact.html': {
                title: 'Contact Us - Get Your Interior Design Quote | Kala Design Co',
                description: 'Ready to transform your space? Contact Kala Design Co for a consultation. Professional interior design services in Delhi and surrounding areas.',
                defaultDescription: 'Get in touch with our interior design team for your next project.'
            }
        };
        
        return pages[path] || pages['/'];
    }

    updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = this.createMetaTag(name, content);
        } else {
            meta.setAttribute('content', content);
        }
        return meta;
    }

    createMetaTag(name, content) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
        return meta;
    }

    addStructuredData() {
        // Remove existing structured data
        const existing = document.querySelector('script[type="application/ld+json"]');
        if (existing) {
            existing.remove();
        }

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Kala Design Co",
            "description": "Premier interior design studio specializing in residential and commercial spaces",
            "url": window.location.origin,
            "logo": `${window.location.origin}/assets/kdc-logo.jpg`,
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": this.siteData.settings.phone,
                "contactType": "customer service",
                "email": this.siteData.settings.email
            },
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Delhi",
                "addressCountry": "IN",
                "streetAddress": this.siteData.settings.address
            },
            "sameAs": [
                this.siteData.settings.instagram,
                this.siteData.settings.linkedin,
                this.siteData.settings.facebook
            ].filter(url => url),
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": "28.6139",
                    "longitude": "77.2090"
                },
                "geoRadius": "50000"
            },
            "priceRange": "$$-$$$",
            "openingHours": "Mo-Fr 09:00-18:00, Sa 10:00-16:00"
        };

        // Add service-specific structured data for services page
        if (window.location.pathname.includes('services')) {
            structuredData["@type"] = "ProfessionalService";
            structuredData.serviceType = "Interior Design";
            structuredData.areaServed = "Delhi, NCR, India";
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
    }

    setupOpenGraph() {
        const currentPage = this.getCurrentPageInfo();
        const ogImage = `${window.location.origin}/assets/kdc-logo.jpg`;
        
        this.updateMetaProperty('og:title', currentPage.title);
        this.updateMetaProperty('og:description', currentPage.description);
        this.updateMetaProperty('og:image', ogImage);
        this.updateMetaProperty('og:url', window.location.href);
        this.updateMetaProperty('og:type', 'website');
        this.updateMetaProperty('og:site_name', 'Kala Design Co');
        this.updateMetaProperty('og:locale', 'en_US');
    }

    setupTwitterCards() {
        const currentPage = this.getCurrentPageInfo();
        const twitterImage = `${window.location.origin}/assets/kdc-logo.jpg`;
        
        this.updateMetaName('twitter:card', 'summary_large_image');
        this.updateMetaName('twitter:title', currentPage.title);
        this.updateMetaName('twitter:description', currentPage.description);
        this.updateMetaName('twitter:image', twitterImage);
        this.updateMetaName('twitter:site', '@kaladesignco');
    }

    updateMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
        return meta;
    }

    updateMetaName(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
        return meta;
    }

    addCanonicalURL() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', window.location.href);
    }

    setupGoogleSearchConsole() {
        if (this.siteData.seo.searchConsole) {
            let meta = document.querySelector('meta[name="google-site-verification"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'google-site-verification');
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', this.siteData.seo.searchConsole);
        }
    }

    optimizeImages() {
        // Add loading="lazy" to images below the fold
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            // Skip first few images (above the fold)
            if (index > 2 && !img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Add alt text if missing
            if (!img.hasAttribute('alt')) {
                const altText = this.generateAltText(img);
                img.setAttribute('alt', altText);
            }
        });
    }

    generateAltText(img) {
        const src = img.src;
        const fileName = src.split('/').pop().split('.')[0];
        
        // Try to generate meaningful alt text from filename
        const altText = fileName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        
        return altText || 'Interior design image';
    }

    // Performance optimizations
    addPreconnectLinks() {
        const preconnects = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com'
        ];

        preconnects.forEach(url => {
            if (!document.querySelector(`link[href="${url}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = url;
                if (url.includes('gstatic')) {
                    link.crossOrigin = 'anonymous';
                }
                document.head.appendChild(link);
            }
        });
    }

    addPrefetchLinks() {
        // Prefetch likely next pages
        const currentPath = window.location.pathname;
        const prefetchPages = {
            '/': ['/about.html', '/services.html'],
            '/index.html': ['/about.html', '/services.html'],
            '/about.html': ['/services.html', '/work.html'],
            '/services.html': ['/work.html', '/contact.html'],
            '/work.html': ['/contact.html', '/services.html'],
            '/contact.html': ['/services.html', '/work.html']
        };

        const pagesToPrefetch = prefetchPages[currentPath] || [];
        pagesToPrefetch.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        });
    }

    // Monitor and report SEO issues
    auditSEO() {
        const issues = [];
        
        // Check title length
        const title = document.title;
        if (title.length < 30 || title.length > 60) {
            issues.push(`Title length (${title.length}) should be between 30-60 characters`);
        }
        
        // Check meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            issues.push('Missing meta description');
        } else {
            const descLength = metaDesc.getAttribute('content').length;
            if (descLength < 120 || descLength > 160) {
                issues.push(`Meta description length (${descLength}) should be between 120-160 characters`);
            }
        }
        
        // Check for h1 tag
        const h1Tags = document.querySelectorAll('h1');
        if (h1Tags.length === 0) {
            issues.push('Missing H1 tag');
        } else if (h1Tags.length > 1) {
            issues.push('Multiple H1 tags found');
        }
        
        // Check images without alt text
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
            issues.push(`${imagesWithoutAlt.length} images missing alt text`);
        }
        
        // Check for canonical URL
        if (!document.querySelector('link[rel="canonical"]')) {
            issues.push('Missing canonical URL');
        }
        
        return issues;
    }

    // Watch for updates from admin panel
    watchForUpdates() {
        setInterval(() => {
            const newSiteData = this.loadSiteData();
            if (JSON.stringify(newSiteData) !== JSON.stringify(this.siteData)) {
                this.siteData = newSiteData;
                this.updateMetaTags();
                this.addStructuredData();
                this.setupOpenGraph();
                this.setupTwitterCards();
                this.setupGoogleSearchConsole();
                console.log('SEO data updated from admin panel');
            }
        }, 30000);
    }

    // Generate sitemap data
    generateSitemapData() {
        const pages = [
            { url: '/', priority: 1.0, changefreq: 'weekly' },
            { url: '/about.html', priority: 0.8, changefreq: 'monthly' },
            { url: '/services.html', priority: 0.9, changefreq: 'weekly' },
            { url: '/work.html', priority: 0.9, changefreq: 'weekly' },
            { url: '/contact.html', priority: 0.7, changefreq: 'monthly' }
        ];

        return pages.map(page => ({
            ...page,
            url: `${window.location.origin}${page.url}`,
            lastmod: new Date().toISOString().split('T')[0]
        }));
    }
}

// Initialize SEO Manager
const seoManager = new SEOManager();

// Make available globally
window.seoManager = seoManager;

// Add preconnect links for performance
seoManager.addPreconnectLinks();

// Add prefetch links for likely next pages
seoManager.addPrefetchLinks();

// Run SEO audit in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
        const issues = seoManager.auditSEO();
        if (issues.length > 0) {
            console.warn('SEO Issues Found:', issues);
        } else {
            console.log('✅ No SEO issues found');
        }
    }, 2000);
}