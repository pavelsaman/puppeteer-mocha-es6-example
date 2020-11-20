import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import emails from '../../Resources/clientEmails.json';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

suite('Email', () => {

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
        await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    });

    teardown(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    test('Mailto in email links', async () => {
    
        const emailLinks = await page.$$('[href="mailto:' 
            + emails[env.lang()] + '"]'
        );       

        expect(emailLinks.length).to.equal(2);
    });
});