import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import Header from '../../Objects/header';
import emails from '../../Resources/clientEmails.json';
import Cart from '../../Objects/cart';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

suite('Empty cart', () => {

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
        await page.goto(baseUrl), { waitUntil: 'networkidle0' };
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.evaluate(
                selector => {
                    document.querySelector(selector).click();
                },
                Header.cart
            )
        ]);
    });

    teardown(async () => {        
        await context.close();
    });

    test('Correct email', async () => {

        const emailLinks = await page.$$('[href="mailto:' 
            + emails[env.lang()] + '"]'
        );       

        expect(emailLinks.length).to.equal(2);    
    });

    test('Can go back to homepage', async () => {

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click(Cart.steps.one.goShopping)
        ]);

        const url = await page.url();
        expect(url).to.equal(baseUrl);
    });

    test('Warning message is visible', async () => {

        await page.waitForSelector(Cart.steps.one.warning);
    });
});