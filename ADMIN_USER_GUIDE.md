# Kala Design Co - Website Administration Guide

Welcome to your website admin panel! This guide will explain how to log in, manage your portfolio of projects, and check messages from potential clients.

## 1. Accessing the Admin Panel

![Admin Login Screen](C:\Users\ks209\.gemini\antigravity\brain\dab78f2a-3439-44be-a64c-2c2dbb6eede0\admin_login_screen_real.png)

1. Go to your website's admin URL (e.g., `yourwebsite.com/admin` or `yourwebsite.com/admin/login.html`).
2. You will see a secure login screen.
3. Enter your administrator email: **`admin@kaladesignco.com`**
4. Enter your password. (If you haven't set one yet, please use the password you configured via Supabase).
5. Click **Login** to access your dashboard.

---

## 2. Navigating the Dashboard

![Admin Dashboard Overview](C:\Users\ks209\.gemini\antigravity\brain\dab78f2a-3439-44be-a64c-2c2dbb6eede0\admin_dashboard_overview_real.png)

Once logged in, the left sidebar allows you to navigate the different areas of your admin panel:
*   **Dashboard Overview**: A quick summary of your website's activity.
*   **Manage Works**: Where you add, edit, or remove projects shown on your website's Portfolio.
*   **Messages**: Access constraints, inquiries, and messages sent via your website's Contact form.

---

## 3. Managing Projects (Works)

This is how you keep your portfolio updated with your latest interior design projects.

![Admin Manage Works](C:\Users\ks209\.gemini\antigravity\brain\dab78f2a-3439-44be-a64c-2c2dbb6eede0\admin_manage_works_real.png)

### Adding a New Project
1. Navigate to the **Manage Works** section from the sidebar.
2. Click the **"Add New Project"** button.
3. A form will appear. Fill in the following details:
    *   **Project Title**: The name of the project (e.g., "Modern Minimalist Villa").
    *   **Category**: The type of project (e.g., "Residential", "Commercial").
    *   **Location**: Where the project is located.
    *   **Year**: The year it was completed.
    *   **Description**: A brief summary of the design goals and features.
    *   **Image URL**: The path or internet link to the project's cover image.
        *   *If you uploaded an image inside your `assets/projects/` folder, enter the path like this: `./assets/projects/your-image-name.jpg`*
    *   **Featured**: Check this box if you want this project highlighted on your home page scroll.
4. Click **Save Changes**. Your new project will automatically sync and appear live on your website!

### Editing an Existing Project
1. On the **Manage Works** page, scroll through your list of existing projects.
2. Find the project you want to modify and click the **"Edit"** button next to it.
3. Update any of the details in the form.
4. Click **Save Changes** to publish your updates immediately.

### Deleting a Project
1. Find the project you wish to remove.
2. Click the **"Delete"** button next to it.
3. Confirm that you want to delete the project. *Warning: This cannot be undone.*

---

## 4. Checking Client Messages

When prospective clients fill out the contact form on your website, their information is stored here.

1. Navigate to the **Messages** section from the admin sidebar.
2. You will see a table listing all submitted inquiries, containing:
    *   **Date**: When the message was sent.
    *   **Name & Email**: The client's contact info.
    *   **Service**: The type of service they selected (e.g., Consultation, Residential Design).
    *   **Message**: Their direct message.
3. You can review these items directly in this panel.

*(Note: If you have enabled the Google Sheets integration, these messages will also appear in real-time in your designated Google Sheet document.)*

---

### Troubleshooting & Tips
*   **Images aren't loading**: Ensure that your image paths strictly follow the correct spelling, including lowercase/uppercase letters. A typo like `./assets/Projects/image.JPG` when the folder is actually `projects/` and the image is `.jpg` will cause it to fail.
*   **Changes aren't syncing**: Our system utilizes an auto-sync mechanism (`frontend-sync.js`). When you edit or add a project, saving the changes inside your admin immediately sends it to the database, which automatically pushes it to your live page. Try refreshing the live website to see recent changes!
