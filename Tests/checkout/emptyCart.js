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

describe('Empty cart', () => {

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
        await page.goto(baseUrl), { waitUntil: 'networkidle0' };
        await Promise.all([
            page.evaluate(
                selector => {
                    document.querySelector(selector).click();
                },
                Header.cart
            ),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);
    });

    afterEach(async () => {        
        await context.close();
    });

    it('Correct email', async () => {

        const emailLinks = await page.$$('[href="mailto:' 
            + emails[env.lang()] + '"]'
        );       

        expect(emailLinks.length).to.equal(2);    
    });

    it('Can go back to homepage', async () => {

        await Promise.all([
            page.click(Cart.steps.one.goShopping),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

        const url = await page.url();
        expect(url).to.equal(baseUrl);
    });

    it('Warning message is visible', async () => {

        await page.waitForSelector(Cart.steps.one.warning);
    });
});