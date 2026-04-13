const { chromium } = require('playwright-core');
const fs = require('fs');

async function extractTargonData() {
    const browser = await chromium.launch({
        headless: true,
        executablePath: '/root/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to sign-in page...');
    await page.goto('https://targon.com/sign-in', { waitUntil: 'domcontentloaded', timeout: 60000 });

    try {
        console.log('Attempting login...');
        await page.fill('input[type="email"]', 'john.doe@bluewave.com');
        await page.fill('input[type="password"]', 'Criticalasset@2026');
        await page.click('button[type="submit"]'); // Adjust selector as needed

        console.log('Waiting for navigation after login...');
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => console.log('Navigation timeout, continuing...'));
    } catch (err) {
        console.log('Login failed or not needed:', err.message);
    }

    console.log('Navigating to rental page...');
    await page.goto('https://targon.com/rentals/wrk-ufgxkm54avvi', { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('Waiting for content to load...');
    await page.waitForTimeout(10000);

    const title = await page.title();
    console.log('Page Title:', title);

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
    console.error('Error:', err);
    process.exit(1);
});
