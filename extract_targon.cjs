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

    console.log('Navigating to Targon rental page...');
    await page.goto('https://targon.com/rentals/wrk-ufgxkm54avvi', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for the specific data elements to appear. 
    // Since I don't know the exact selectors, I'll wait for 10 seconds to ensure JS execution is complete.
    console.log('Waiting for content to load...');
    await page.waitForTimeout(10000);

    const title = await page.title();
    console.log('Page Title:', title);

    const bodyText = await page.innerText('body');
    fs.writeFileSync('/root/Cyber_Kinetic_Crisis/targon_data_extracted.txt', bodyText);
    console.log('Body text extracted to targon_data_extracted.txt');

    // Take a screenshot to see what's on the page
    await page.screenshot({ path: '/root/Cyber_Kinetic_Crisis/targon_screenshot.png', fullPage: true });
    console.log('Screenshot saved to targon_screenshot.png');

    // Look for any links that might be "files"
    const links = await page.$$eval('a', as => as.map(a => ({ text: a.innerText, href: a.href })));
    fs.writeFileSync('/root/Cyber_Kinetic_Crisis/targon_links.json', JSON.stringify(links, null, 2));
    console.log('Links extracted to targon_links.json');

    await browser.close();
}

extractTargonData().catch(err => {
    console.error('Error extracting data:', err);
    process.exit(1);
});
