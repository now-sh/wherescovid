const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Listen for console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:1234', { waitUntil: 'networkidle2' });
  
  // Wait a bit for JavaScript to execute
  await page.waitForTimeout(3000);
  
  // Get the content of key elements
  const yourLocation = await page.$eval('#your-location', el => el.textContent);
  const closestLocation = await page.$eval('#closest-location', el => el.textContent);
  
  console.log('Your Location:', yourLocation);
  console.log('Closest Location:', closestLocation);
  
  await browser.close();
})();