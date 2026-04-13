const { chromium } = require('playwright-core');
const fs = require('fs');

async function extractTargonData() {
    const browser = await chromium.launch({
        headless: true,
        executablePath: '/root/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    console.log('Navigating to sign-in page...');
    await page.goto('https://targon.com/sign-in', { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(5000);

    try {
        console.log('Filling login credentials...');
        await page.fill('#email', 'john.doe@bluewave.com');
        await page.fill('#password', 'Criticalasset@2026');
        
        console.log('Clicking login button...');
        // Looking for the "Log In" button by text since I don't see a clear ID in the previous grep
        await page.click('button:has-text("Log In")');

        console.log('Waiting for post-login redirection...');
        await page.waitForTimeout(10000);
    } catch (err) {
        console.log('Login attempt encountered an issue:', err.message);
    }

    console.log('Navigating to rental page: wrk-ufgxkm54avvi');
    await page.goto('https://targon.com/rentals/wrk-ufgxkm54avvi', { waitUntil: 'load', timeout: 60000 });
    
    // Increased wait time for slow JS rendering
    console.log('Waiting for rental data to render...');
    await page.waitForTimeout(15000);

    const title = await page.title();
    console.log('Final Page Title:', title);

    const bodyText = await page.innerText('body');
    fs.writeFileSync('/root/Cyber_Kinetic_Crisis/targon_data_extracted.txt', bodyText);
    
    const htmlContent = await page.content();
    fs.writeFileSync('/root/Cyber_Kinetic_Crisis/targon_page_full.html', htmlContent);

    await page.screenshot({ path: '/root/Cyber_Kinetic_Crisis/targon_screenshot.png', fullPage: true });

    const links = await page.$$eval('a', as => as.map(a => ({ text: a.innerText, href: a.href })));
    fs.writeFileSync('/root/Cyber_Kinetic_Crisis/targon_links.json', JSON.stringify(links, null, 2));

    await browser.close();
}

extractTargonData().catch(err => {
    console.error('Final Error:', err);
    process.exit(1);
});
