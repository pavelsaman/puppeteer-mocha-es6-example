import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import ProductListing from '../../Objects/productListing';
import ProductSort from '../../Objects/productSort';
import removeCurrency from '../../Helpers/currency';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

async function sortProductListing (page, el) {
    const link = await page.$eval(el,
        selector => selector.getAttribute("href") 
    );
    await page.goto(baseUrl + link, {waitUntil: 'networkidle0' });
    await page.waitForSelector(ProductListing.productItem,
        { visibility: true }
    );
    const c = await page.$eval(el,
        selector => selector.getAttribute("class") 
    );
    expect(c).to.contain('active');
}

describe('Product sort', () => {

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
        await page.goto(baseUrl + 'produkty', {waitUntil: 'networkidle0' });
        await page.waitForSelector(ProductListing.productItem,
            { visibility: true }
        );
    });

    afterEach(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    it('Sort products by cheapest', async () => {

        // sort
        await sortProductListing(page, ProductSort.cheapest);

        // get prices
        let prices = await page.$$eval(ProductListing.productPrice,
            (selector) => {
                return selector.map(s => s.innerText)
            } 
        );

        // get rid of currency and white space
        prices = prices.map(e => removeCurrency(
            e,
            config.currency[env.lang()])
        );
        prices = prices.map(e => e.replace(' ', ''));
        
        // sort
        let orderedPrices = prices.slice();
        orderedPrices.sort((a, b) => a - b);
        
        expect(prices).to.have.ordered.members(orderedPrices);       
    });

    it('Sort products by the most expensive', async () => {

        // sort
        await sortProductListing(page, ProductSort.mostExpensive);

        // get prices
        let prices = await page.$$eval(ProductListing.productPrice,
            (selector) => {
                return selector.map(s => s.innerText)
            } 
        );

        // get rid of currency and white space
        prices = prices.map(e => removeCurrency(
            e,
            config.currency[env.lang()])
        );
        prices = prices.map(e => e.replace(' ', ''));
        
        // sort
        let orderedPrices = prices.slice();
        orderedPrices.sort((a, b) => b - a);
        
        expect(prices).to.have.ordered.members(orderedPrices);       
    });

    it('Sort products by the biggest discount', async () => {

        // sort
        await sortProductListing(page, ProductSort.biggestDiscount);

        // get discounts
        let discounts = await page.$$eval(ProductListing.productDiscount,
            (selector) => {
                return selector.map(s => s.innerText)
            } 
        );

        // get rid of currency and white space
        discounts = discounts.map(e => e.replace('%', ''));
        discounts = discounts.map(e => e.replace(' ', ''));
        discounts = discounts.map(e => e.replace('-', ''));
        
        // sort
        let orderedDiscounts = discounts.slice();
        orderedDiscounts.sort((a, b) => b - a);
        
        expect(discounts).to.have.ordered.members(orderedDiscounts);       
    });
});