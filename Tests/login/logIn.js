import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import credentials from '../../Resources/credentials.json';
import LoginPopup from '../../Objects/loginPopup';
import Header from '../../Objects/header';
import FlashMessage from '../../Objects/flashMessage';
import FBLoginPage from '../../Objects/fbLoginPage';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

suite('Valid login', () => {

    let browser, context, page;

    suiteSetup(async () => {
        browser = await puppeteer.launch(browserConfig())
    });

    suiteTeardown(async () => {
        await browser.close();
    });

    setup(async () => {
        context = await browser.createIncognitoBrowserContext();
        page = await context.newPage();
        await page.goto(baseUrl, {waitUntil: 'networkidle0' });
    });

    teardown(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    Object.entries(credentials).forEach(([key, c]) => {        
        test('Login with ' + key, async () => {

            // home page
            await page.waitForSelector(Header.account, { visibility: true });
            await Promise.all([
                page.click(Header.account),
                page.waitForSelector(LoginPopup.popup, { visibility: true })
            ]);
    
            // login popup        
            await LoginPopup.fillInCredentials(page, c, key);
            if (key === "facebook") {
                await Promise.all([
                    page.click(FBLoginPage.fbLoginButton),
                    page.waitForNavigation({ waitUntil: 'networkidle0' })
                ]);
            } else {
                await Promise.all([
                    page.click(LoginPopup.popup + ' >* ' 
                        + LoginPopup.logInButton
                    ),
                    page.waitForSelector(FlashMessage.info)
                ]);    
            }            
    
            // back at home page
            const name = await page.$eval(Header.account, el => el.innerText);
            expect(name).not.eql(
                (env.lang() === 'cz') ? 'Přihlášení' : 'Môj účet'
            );
        });
    });
});