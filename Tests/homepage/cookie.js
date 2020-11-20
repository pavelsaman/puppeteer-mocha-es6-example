import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import getCookie from '../../Helpers/cookie';
import CookieStripe from '../../Objects/cookieStripe';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

suite('Cookies', () => {

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
        await page.goto(baseUrl, {waitUntil: 'networkidle2' });
    });

    teardown(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    test('Cookie is saved after confirmation', async () => {

        await page.waitForSelector(CookieStripe.cookieStripe);
        let cookies = await page.cookies();
        expect(
            getCookie(
                cookies,
                { 
                    searchFor: 'name', 
                    searchValue: 'cookieAllowed' 
                }
            )
        ).to.be.false;

        await page.click(CookieStripe.confirm);
        cookies = await page.cookies();
        expect(
            getCookie(
                cookies,
                { 
                    searchFor: 'name', 
                    searchValue: 'cookieAllowed' 
                }
            )
        ).to.be.true;        
    });
});