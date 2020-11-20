import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import ProductDetail from '../../Objects/productDetail';
import ProductPopup from '../../Objects/productPopup';
import SizesPopup from '../../Objects/sizesPopup';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];
const productUrl = "damska-mikina-cussa/lswp203407";

function popupIsOpen(page, popupSelector) {
    return page.waitForFunction(
        selector => {
            let p = document.querySelector(selector);
            if (p) {
                return p.getAttribute("class").includes('visible');
            }
            return false;
        },
        {},
        popupSelector
    );
}

function popupIsClosed(page, popupSelector) {
    return page.waitForFunction(
        selector => {
            let p = document.querySelector(selector);
            if (p) {
                return !p.getAttribute("class").includes('visible');
            }
            if (!p) {
                return true;
            }
            return false;
        },
        {},
        popupSelector
    );
}

suite('Popups on product detail', () => {

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
        await page.goto(baseUrl + productUrl, { waitUntil: 'networkidle0' });
    });

    teardown(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    test('Open and close sizes popup', async () => {
        
        await page.waitForSelector(ProductDetail.sizesLink,
            { visibility: true }
        );
        await popupIsClosed(page, SizesPopup.popup);

        // open sizes popup
        await Promise.all([
            page.evaluate(
                selector => document.querySelector(selector).click(),
                ProductDetail.sizesLink
            ),
            popupIsOpen(page, SizesPopup.popup),
            popupIsClosed(page, ProductPopup.popup)
        ]);    
        
        // close sizes popup
        await Promise.all([
            page.evaluate(
                selector => document.querySelector(selector).click(),
                SizesPopup.close
            ),
            popupIsClosed(page, SizesPopup.popup),
            popupIsClosed(page, ProductPopup.popup)
        ]);
    });

    test('Open and close product and sizes popup', async () => {
        
        // open and close product popup        
        await ProductDetail.addProductIntoCart(page, 1);
        await Promise.all([
            page.click(ProductPopup.goBack),
            popupIsClosed(page, ProductPopup.popup),
            popupIsClosed(page, SizesPopup.popup)
        ]);

        // open and close sizes popup
        await Promise.all([
            page.evaluate(
                selector => document.querySelector(selector).click(),
                ProductDetail.sizesLink
            ),
            popupIsOpen(page, SizesPopup.popup),
            popupIsClosed(page, ProductPopup.popup)
        ]);

        // close sizes popup
        await Promise.all([
            page.evaluate(
                selector => document.querySelector(selector).click(),
                SizesPopup.close
            ),
            popupIsClosed(page, SizesPopup.popup),
            popupIsClosed(page, ProductPopup.popup)
        ]);
    });
});