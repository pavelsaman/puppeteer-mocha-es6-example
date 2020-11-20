import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import ProductListing from '../../Objects/productListing';
import ProductDetail from '../../Objects/productDetail';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];
const couponValue = 'AKCE20';

suite('Clipboard discout code', () => {

    let browser, context, page;

    suiteSetup(async () => {
        browser = await puppeteer.launch(browserConfig())
    });

    suiteTeardown(async () => {
        await browser.close();
    });

    setup(async () => {
        context = await browser.createIncognitoBrowserContext();
        await context.overridePermissions(baseUrl, [
            'clipboard-read'            
        ]);
        page = await context.newPage();
        await page.goto(baseUrl + 'produkty', { waitUntil: 'networkidle0' });
        await page.waitForSelector(ProductListing.productItem,
            { visibility: true }
        );
    });

    teardown(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    test('Coupon has a help text on product listing page', async () => {
        const productCouponHelpText = await page.$eval(ProductListing.coupon,
            el => el.getAttribute("data-title")
        );    
        expect(productCouponHelpText).not.to.be.empty;
    });

    test('Coupon has a help text on product detail page', async () => {
        
        const productLink = await page.$eval(
            ProductListing.productItem,
            (el) => el.getAttribute("href")
        );
        
        // product detail page
        await page.goto(baseUrl + productLink, { waitUntil: 'networkidle0' });
        await Promise.all([            
            page.waitForSelector(ProductDetail.name, { visibility: true }),
            page.waitForSelector(ProductDetail.coupon, { visibility: true })
        ]);

        const productCouponHelpText = await page.$eval(ProductDetail.coupon,
            el => el.getAttribute("data-title")
        );
        expect(productCouponHelpText).not.to.be.empty;
    });

    test('Copy discount code into clipboard from product listing', async () => { 

        await Promise.all([
            page.waitForSelector(ProductListing.productItem,
                { visibility: true }
            ),
            page.waitForSelector(ProductListing.coupon, { visibility: true })
        ]);
        
        // click and copy into clipboard
        await Promise.all([
            page.evaluate((selector) => {
                    document.querySelector(selector).click()
                }, ProductListing.coupon
            ),
            page.waitForFunction('navigator.clipboard.readText() != ""')
        ]);

        const clipboardContent
            = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardContent).to.equal(couponValue);        
    });

    test('Copy discount code into clipboard from product detail', async () => {
        
        // go to product detail page
        const productLink = await page.$eval(
            ProductListing.productItem,
            (el) => el.getAttribute("href")
        );
        await page.goto(baseUrl + productLink, { waitUntil: 'networkidle0' });
        await Promise.all([    
            page.waitForSelector(ProductDetail.name, { visibility: true }),
            page.waitForSelector(ProductDetail.coupon), { visibility: true }
        ]);

        // click and copy into clipboard
        await Promise.all([
            page.evaluate((selector) => {
                    document.querySelector(selector).click()
                }, ProductDetail.coupon
            ),
            page.waitForFunction('navigator.clipboard.readText() != ""')
        ]);

        const clipboardContent = 
            await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardContent).to.equal(couponValue);
    });
});