/**
 * Contact Form Handler for Google Sheets
 * Submits form data to a Google Apps Script Web App
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm') || document.querySelector('.contact-form form');

    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    // 1. Validate
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Basic validation
    if (!data.name || !data.email || !data.message) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }

    // 2. Prepare for submission
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // 3. Google Apps Script Web App URL
    // TODO: User must replace this with their deployed Web App URL
    const SCRIPT_URL = 'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_URL';

    if (SCRIPT_URL === 'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_URL') {
        setTimeout(() => {
            showMessage('Error: Google Sheets Script URL not configured. Please see GOOGLE_SHEETS_SETUP.md', 'error');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }, 1000);
        return;
    }

    try {
        // 4. Send Data
        // specific mode: 'no-cors' is often needed for Google Apps Script, 
        // but it means we get an opaque response.
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData, // FormData sends as multipart/form-data
            mode: 'no-cors'
        });

        // Since mode is no-cors, we can't check response.ok or response.json()
        // We assume success if no network error thrown.

        form.reset();
        showMessage('Thank you! Your message has been sent.', 'success');

    } catch (error) {
        console.error('Submission Error:', error);
        showMessage('Something went wrong. Please try again later.', 'error');
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

function showMessage(msg, type) {
    // Remove existing
    const existing = document.querySelector('.form-message-alert');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = `form-message-alert ${type}`;
    div.textContent = msg;

    div.style.cssText = `
        padding: 1rem;
        margin-top: 1rem;
        border-radius: 4px;
        text-align: center;
        font-family: sans-serif;
        font-size: 0.9rem;
    `;

    if (type === 'success') {
        div.style.backgroundColor = '#d4edda';
        div.style.color = '#155724';
        div.style.border = '1px solid #c3e6cb';
    } else {
        div.style.backgroundColor = '#f8d7da';
        div.style.color = '#721c24';
        div.style.border = '1px solid #f5c6cb';
    }

    const form = document.getElementById('contactForm') || document.querySelector('.contact-form form');
    if (form) form.appendChild(div);

    setTimeout(() => div.remove(), 6000);
}
