import puppeteer from 'puppeteer';

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const FRONT_PORT = process.env.FRONT_SERVE_PORT || 3001;

export const FRONT_URL = `http://localhost:${FRONT_PORT}`;

console.log(`Running front on ${FRONT_URL}`);

beforeAll(async () => {
	browser = await puppeteer.launch({
		headless: true,
		devtools: false,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	page = await browser.newPage();
	page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`));
	await page.setViewport({ width: 1366, height: 768 });
});

afterAll(async () => {
	await browser.close();
});


describe('Test App', () => {
	beforeAll(async () => {
		await page.goto(`${FRONT_URL}/`);
	});

	test('Login Page', async () => {
		await page.waitForSelector('#login-form-container');

		const userInput = await page.$('#email-address-input');
		await userInput?.focus();
		await userInput?.type('haim.kastner@gmail.com');

		const passwordInput = await page.$('#login-password');
		await passwordInput?.focus();
		await passwordInput?.type('Pass$$rd');

		const submitButton = await page.$('#login-submit');
		await submitButton?.click();

		await page?.waitForSelector('#minion-grid-box-0', {
			timeout: 1000 * 60
		});
	});

	test('Network Page', async () => {
		await page.goto(`${FRONT_URL}/#/dashboard/network`);
		await page?.waitForSelector('#network-page-container', {
			timeout: 1000 * 60
		});
	});
});


