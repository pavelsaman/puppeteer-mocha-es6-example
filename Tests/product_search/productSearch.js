import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import Fulltext from '../../Objects/fulltext';
import FlashMessage from '../../Objects/flashMessage';
import InfoStripe from '../../Objects/infoStripe';
import ProductDetail from '../../Objects/productDetail';
import ProductListing from '../../Objects/productListing';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];
const invalidSearchTerms = require('../../Resources/invalidSearchTerms.json');
let searchTerm = (env.lang() === "cz") ? 'boty' : 'detská';

async function waitForSearchSuggestions (page, searchTerm) {    
    await Promise.all([
        page.waitForSelector(Fulltext.searchContainer, { visibility: false }),
        page.waitForSelector(Fulltext.showMore, { visibility: true }),
        page.waitForSelector(Fulltext.close, { visibility: true }),
        page.waitForResponse(
            response => response.status() === 200
                && response.url()
                    === encodeURI(baseUrl
                        + Fulltext.suggestUrl.replace('{term}', searchTerm))
        , config.reqTimeout)
    ]);
}

suite('Product search', () => {

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
        await Promise.all([
            page.waitForSelector(Fulltext.input, { visibility: true }),
            page.waitForSelector(Fulltext.glass, { visibility: true })
        ]);
    });

    teardown(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });    

    test('Fulltext input has max length', async () => {
        const length = await page.$eval(Fulltext.input,
            el => parseInt(el.getAttribute("maxlength"))
        );
        expect(length).to.equal(50);
    });

    test('Search with keyword and click glass', async () => {       
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(Fulltext.glass);
        await page.waitForSelector(ProductListing.productItem);
    });

    test('Search with national characters and click glass', async () => {           
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(Fulltext.glass);
        await page.waitForSelector(ProductListing.productItem);
    });

    if (env.lang() === "cz") {
        test('Search with hyphenated keyword and click glass', async () => {      
            await page.type(Fulltext.input, searchTerm);
            await waitForSearchSuggestions(page, searchTerm);
            await page.click(Fulltext.glass);
            await page.waitForSelector(ProductListing.productItem);
        });
    }

    test('Search with empty string', async () => {       
        await page.click(Fulltext.glass);
        await page.waitForSelector(ProductListing.productItem);
    });

    test('Dropdown disappears after clicking close', async () => {
        await page.type(Fulltext.input, searchTerm);        
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(Fulltext.close);
        await page.waitForSelector(
            Fulltext.searchContainer,
            { visibility: false }
        );
    });

    test('Dropdown disappears after clicking elsewhere', async () => {
        await page.type(Fulltext.input, searchTerm);        
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(InfoStripe.stripe);
        await page.waitForSelector(
            Fulltext.searchContainer,
            { visibility: false }
        );
    });

    test('Search with keyword and click "show more"', async () => {
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(Fulltext.showMore);
        await page.waitForSelector(ProductListing.productItem);
    });

    test('Search with keyword and click on first item', async () => {
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        const productLinks = await page.$$(Fulltext.searchContainer + ' > a');
        await productLinks[0].click();
        await page.waitForSelector(ProductDetail.name);
    });

    test('Search with keyword and click on second item', async () => {
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        const productLinks = await page.$$(Fulltext.searchContainer + ' > a');
        await productLinks[1].click();
        await page.waitForSelector(ProductDetail.name);
    });

    invalidSearchTerms.forEach(term => {
        test.only('Search for invalid term "' + term + '"', async () => {
            await page.type(Fulltext.input, term);
            await page.waitForSelector(Fulltext.close, { visibility: true });
            await page.click(Fulltext.glass);
            await page.waitForSelector(ProductListing.productItem,
                { visibility: true }
            );
            await page.waitForSelector(FlashMessage.warning,
                { visibility: true }
            );
        });
    });    
});