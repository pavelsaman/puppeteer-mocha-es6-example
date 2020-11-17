import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import emails from '../../Resources/clientEmails.json';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

describe('Email', () => {

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
        await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    });

    afterEach(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    it('Mailto in email links', async () => {
    
        const emailLinks = await page.$$('[href="mailto:' 
            + emails[env.lang()] + '"]'
        );       

        expect(emailLinks.length).to.equal(2);
    });
});