import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import ProductListing from '../../Objects/productListing';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

describe('Product URLs', () => {

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
        await page.goto(baseUrl + 'produkty', { waitUntil: 'networkidle0' });
    });

    afterEach(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    it('Product detail page has nice URL', async () => {
    
        const product = await page.$$(ProductListing.productItem);

        await Promise.all([
            product[0].click(),
            page.waitForNavigation()
        ]);
        expect(page.url()).not.to.include('Product/Detail');
        await page.goBack();

        await Promise.all([
            product[1].click(),
            page.waitForNavigation()
        ]);
        expect(page.url()).not.to.include('Product/Detail');        
    });
});