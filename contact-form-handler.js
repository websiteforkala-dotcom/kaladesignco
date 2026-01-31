// Contact Form Handler
class ContactFormHandler {
    constructor() {
        this.init();
    }

    init() {
        // Find all contact forms on the page
        const contactForms = document.querySelectorAll('form[data-contact-form], .contact-form form, #contact-form');
        
        contactForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmission(form);
            });
        });

        // Also handle any existing contact form by ID or class
        const mainContactForm = document.querySelector('.contact-form form') || 
                               document.querySelector('#contact-form') ||
                               document.querySelector('form');
        
        if (mainContactForm && !mainContactForm.hasAttribute('data-handled')) {
            mainContactForm.setAttribute('data-handled', 'true');
            mainContactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmission(mainContactForm);
            });
        }
    }

    async handleSubmission(form) {
        // Get form data
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Validate required fields
        if (!this.validateForm(data)) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Save to database
            await this.saveToDatabase(data);
            
            // Send email (in real implementation, this would be a server-side operation)
            this.sendEmail(data);
            
            // Reset form
            form.reset();
            
            // Show success message
            this.showMessage('Thank you! Your message has been sent successfully.', 'success');
            
            // Track analytics event
            this.trackFormSubmission();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            // Restore button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm(data) {
        // Check for required fields
        const requiredFields = ['name', 'email', 'message'];
        
        for (let field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return false;
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return false;
        }

        return true;
    }

    async saveToDatabase(data) {
        // Wait for database service to be available
        if (window.databaseService) {
            await window.databaseService.addContactForm({
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                service: data.service || data.subject || '',
                message: data.message,
                ip: null, // Set to null instead of 'Hidden for privacy'
                userAgent: navigator.userAgent
            });
        } else {
            // Fallback to localStorage
            this.saveToLocalStorage(data);
        }
    }

    saveToLocalStorage(data) {
        const contactForms = JSON.parse(localStorage.getItem('kala_contact_forms') || '[]');
        
        const submission = {
            id: Date.now(),
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            service: data.service || data.subject || '',
            message: data.message,
            created_at: new Date().toISOString(),
            ip: null, // Set to null for consistency
            userAgent: navigator.userAgent
        };

        contactForms.unshift(submission);
        localStorage.setItem('kala_contact_forms', JSON.stringify(contactForms));

        // If admin panel is available, update it
        if (window.adminPanel) {
            window.adminPanel.contactForms = contactForms;
        }
    }

    saveToAdmin(data) {
        // Save to localStorage for admin panel
        const contactForms = JSON.parse(localStorage.getItem('kala_contact_forms') || '[]');
        
        const submission = {
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            service: data.service || data.subject || '',
            message: data.message,
            date: new Date().toISOString(),
            ip: null, // Set to null for consistency
            userAgent: navigator.userAgent
        };

        contactForms.unshift(submission);
        localStorage.setItem('kala_contact_forms', JSON.stringify(contactForms));

        // If admin panel is available, update it
        if (window.adminPanel) {
            window.adminPanel.contactForms = contactForms;
        }
    }

    sendEmail(data) {
        // In a real implementation, this would send data to your backend
        // which would then send an email using a service like SendGrid, Mailgun, etc.
        
        console.log('Email would be sent with data:', data);
        
        // For demonstration, we'll just log the email content
        const emailContent = `
New Contact Form Submission:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Service: ${data.service || data.subject || 'Not specified'}

Message:
${data.message}

Submitted: ${new Date().toLocaleString()}
        `;
        
        console.log('Email content:', emailContent);
    }

    trackFormSubmission() {
        // Track with Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Contact',
                event_label: 'Contact Form'
            });
        }

        // Track with other analytics services
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Contact');
        }

        // Log to database
        if (window.databaseService) {
            window.databaseService.logAnalyticsEvent({
                eventName: 'form_submit',
                category: 'Contact',
                label: 'Contact Form',
                value: 1
            });
        }
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message form-message-${type}`;
        messageEl.textContent = message;
        
        // Style the message
        messageEl.style.cssText = `
            padding: 1rem 1.5rem;
            margin: 1rem 0;
            border-radius: 4px;
            font-weight: 500;
            text-align: center;
            animation: slideDown 0.3s ease;
            ${type === 'success' ? 
                'background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;' : 
                'background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;'
            }
        `;

        // Add animation styles if not already present
        if (!document.querySelector('#form-message-styles')) {
            const styles = document.createElement('style');
            styles.id = 'form-message-styles';
            styles.textContent = `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Find the best place to insert the message
        const form = document.querySelector('.contact-form form') || 
                    document.querySelector('#contact-form') ||
                    document.querySelector('form');
        
        if (form) {
            form.parentNode.insertBefore(messageEl, form.nextSibling);
        } else {
            document.body.appendChild(messageEl);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ContactFormHandler();
    });
} else {
    new ContactFormHandler();
}