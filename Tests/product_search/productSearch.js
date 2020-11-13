import puppeteer from 'puppeteer';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import Fulltext from '../../Objects/fulltext';
import FlashMessage from '../../Objects/flashMessage';
import InfoStripe from '../../Objects/infoStripe';
import ProductDetail from '../../Objects/productDetail';
import ProductListing from '../../Objects/productListing';


const baseUrl = config.baseUrl[env.envWithLang()];
const invalidSearchTerms = require('../../Resources/invalidSearchTerms.json');
let searchTerm = (env.lang() === "cz") ? 'boty' : 'detska';

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

describe('Product search', () => {

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
        await page.goto(baseUrl);        
        await Promise.all([
            page.waitForSelector(Fulltext.input, { visibility: true }),
            page.waitForSelector(Fulltext.glass, { visibility: true })
        ]);
    });

    afterEach(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    it('Search with keyword and click glass', async () => {       
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(Fulltext.glass);
        await page.waitForSelector(ProductListing.productItem);
    });

    it('Search with national characters and click glass', async () => {
        searchTerm = (env.lang() === "cz") ? "čepice" : "detská";    
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(Fulltext.glass);
        await page.waitForSelector(ProductListing.productItem);
    });

    if (env.lang() === "cz") {
        it('Search with hyphenated keyword and click glass', async () => {      
            await page.type(Fulltext.input, searchTerm);
            await waitForSearchSuggestions(page, searchTerm);
            await page.click(Fulltext.glass);
            await page.waitForSelector(ProductListing.productItem);
        });
    }

    it('Search with empty string', async () => {       
        await page.click(Fulltext.glass);
        await page.waitForSelector(ProductListing.productItem);
    });

    it('Dropdown disappears after clicking close', async () => {
        await page.type(Fulltext.input, searchTerm);        
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(Fulltext.close);
        await Promise.all([
            page.waitForSelector(Fulltext.searchContainer,
                { visibility: false })
        ]);
    });

    it('Dropdown disappears after clicking elsewhere', async () => {
        await page.type(Fulltext.input, searchTerm);        
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(InfoStripe.stripe);
        await Promise.all([
            page.waitForSelector(Fulltext.searchContainer,
                { visibility: false })
        ]);
    });

    it('Search with keyword and click "show more"', async () => {
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        await page.click(Fulltext.showMore);
        await page.waitForSelector(ProductListing.productItem);
    }, config.timeout);

    it('Search with keyword and click on first item', async () => {
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        const productLinks = await page.$$(Fulltext.searchContainer + ' > a');
        await productLinks[0].click();
        await page.waitForSelector(ProductDetail.name);
    });

    it('Search with keyword and click on second item', async () => {
        await page.type(Fulltext.input, searchTerm);
        await waitForSearchSuggestions(page, searchTerm);
        const productLinks = await page.$$(Fulltext.searchContainer + ' > a');
        await productLinks[1].click();
        await page.waitForSelector(ProductDetail.name);
    });

    invalidSearchTerms.forEach(term => {
        it('Search for invalid term "' + term + '"', async () => {
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