// Minimal Admin Panel for Testing
console.log('Loading minimal admin script...');

class AdminPanel {
    constructor() {
        console.log('AdminPanel constructor called');
        this.currentSection = 'dashboard';
        this.init();
    }

    async init() {
        console.log('AdminPanel init called');
        try {
            this.setupNavigation();
            console.log('AdminPanel initialized successfully');
        } catch (error) {
            console.error('Error initializing AdminPanel:', error);
        }
    }

    setupNavigation() {
        console.log('Setting up navigation...');
        const navLinks = document.querySelectorAll('.nav-link');
        console.log('Found nav links:', navLinks.length);
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Nav link clicked:', link.dataset.section);
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AdminPanel...');
    try {
        window.adminPanel = new AdminPanel();
        console.log('AdminPanel created successfully');
    } catch (error) {
        console.error('Error creating AdminPanel:', error);
    }
});

console.log('Minimal admin script loaded successfully');