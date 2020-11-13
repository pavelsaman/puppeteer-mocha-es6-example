import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import credentials from '../../Resources/credentials.json';
import LoginPopup from '../../Objects/loginPopup';
import Header from '../../Objects/header';
import FlashMesage from '../../Objects/flashMessage';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

describe('Valid login', () => {

    let browser, context, page;

    before(async () => {
        browser = await puppeteer.launch(browserConfig())
    });

    after(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.createIncognitoBrowserContext();
        page = await context.newPage();
        await page.goto(baseUrl);
    });

    afterEach(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    Object.entries(credentials).forEach(([key, c]) => {        
        it('Login with email', async () => {

            // home page
            await page.waitForSelector(Header.account, { visibility: true });
            await Promise.all([
                page.click(Header.account),
                page.waitForSelector(LoginPopup.popup, { visibility: true })
            ]);
    
            // login popup        
            await LoginPopup.fillInCredentials(page, c, key);
            await Promise.all([
                page.click(LoginPopup.popup + ' >* ' + LoginPopup.logInButton),
                page.waitForSelector(FlashMesage.info)
            ]);
    
            // back at home page
            const name = await page.$eval(Header.account, el => el.innerText);
            expect(name).not.eql(
                (env.lang() === 'cz') ? 'Přihlášení' : 'Môj účet'
            );
        });
    });
});