const puppeteer = require('puppeteer');
const path = require('path');
const url = require('url');

async function capture() {
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1280, height: 800 }
    });
    const page = await browser.newPage();

    const basePath = __dirname;
    const loginUrl = url.pathToFileURL(path.join(basePath, 'kdc-admin', 'login.html')).href;
    const adminUrl = url.pathToFileURL(path.join(basePath, 'kdc-admin', 'index.html')).href;

    const artifactDir = 'C:\\Users\\ks209\\.gemini\\antigravity\\brain\\dab78f2a-3439-44be-a64c-2c2dbb6eede0';

    // 1. Login Screen
    console.log('Navigating to login...');
    await page.goto(loginUrl, { waitUntil: 'networkidle0' });
    const loginSS = path.join(artifactDir, 'admin_login_screen_real.png');
    await page.screenshot({ path: loginSS });
    console.log('Saved:', loginSS);

    // Bypass login for the rest of the screenshots
    await page.evaluate(() => {
        localStorage.setItem('kala_admin_logged_in', 'true');
        localStorage.setItem('kala_admin_login_time', Date.now().toString());
    });

    // 2. Dashboard
    console.log('Navigating to dashboard...');
    await page.goto(adminUrl, { waitUntil: 'networkidle0' });
    const dashSS = path.join(artifactDir, 'admin_dashboard_overview_real.png');
    await page.screenshot({ path: dashSS });
    console.log('Saved:', dashSS);

    // 3. Manage Works
    console.log('Navigating to works portfolio...');
    try {
        await page.waitForSelector('a[data-section="work-portfolio"]', { timeout: 5000 });
        await page.evaluate(() => {
            document.querySelector('a[data-section="work-portfolio"]').click();
        });
        await new Promise(r => setTimeout(r, 1000)); // wait for UI to update
    } catch (e) {
        console.error('Failed to click works portfolio:', e);
        const html = await page.content();
        console.log('Current HTML:', html.substring(0, 500));
        return;
    }
    const worksSS = path.join(artifactDir, 'admin_manage_works_real.png');
    await page.screenshot({ path: worksSS });
    console.log('Saved:', worksSS);

    // 4. Messages
    console.log('Navigating to messages...');
    try {
        await page.waitForSelector('a[data-section="contact-data"]', { timeout: 5000 });
        await page.evaluate(() => {
            document.querySelector('a[data-section="contact-data"]').click();
        });
        await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
        console.error('Failed to click contact data:', e);
    }
    const msgSS = path.join(artifactDir, 'admin_messages_view_real.png');
    await page.screenshot({ path: msgSS });
    console.log('Saved:', msgSS);

    await browser.close();
    console.log('Done capturing screenshots!');
}

capture().catch(console.error);
