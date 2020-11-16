import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import Newsletter from '../../Objects/newsletter';
import FlashMessage from '../../Objects/flashMessage';
import personalDataLinks from '../../Resources/personalDataInfoLinks.json';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

describe('Newsletter', () => {

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
        await page.goto(baseUrl, {waitUntil: 'networkidle0' });
        await page.waitForSelector(Newsletter.email);
    });

    afterEach(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    it('Email input is required', async () => {

        const emailIsRequired = await page.$eval(
            Newsletter.email,
            e => e.hasAttribute("required")
        );
        expect(emailIsRequired).to.be.true;    
    });

    it('Sign up for newsletter', async () => {

        await page.type(Newsletter.email, config.testerEmail);
        await page.click(Newsletter.checkbox);
        await Promise.all([
            page.click(Newsletter.send),
            page.waitForFunction(
                selector => document.querySelector(selector),
                {},
                FlashMessage.confirmation
            )
        ]);
    });

    it('Newletter contains link to more information', async () => {

        await page.waitForSelector(Newsletter.link);
        const hrefAttr = await page.$eval(
            Newsletter.link,
            e => e.getAttribute('href')
        );
        expect(hrefAttr)
            .to.equal(
                (env.lang() === 'cz') 
                    ? personalDataLinks.cz : personalDataLinks.sk
            );
    });
});