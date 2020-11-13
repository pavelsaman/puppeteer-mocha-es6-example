import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config.json';
import takeScreenshot from '../../Helpers/screenshot';
import browserConfig from '../../Helpers/browserOptions';
import ProductDetail from '../../Objects/productDetail';
import ProductPopup from '../../Objects/productPopup';
import Cart from '../../Objects/cart';


let expect = chai.expect;
const baseUrl = config.baseUrl[process.env.OUTLET_ENV];
const productUrl = "panske-kalhoty-pamp/mpak175665";

describe.only('Add product into cart', () => {

    let browser, context, page;

    before(async () => {
        browser = await puppeteer.launch(browserConfig());
    });

    after(async () => {
        browser.close();
    });

    beforeEach(async () => {
        context = await browser.createIncognitoBrowserContext();
        page = await context.newPage();
        await page.goto(baseUrl + productUrl);
        await page.waitForSelector(ProductDetail.addToCart,
            { visibility: true }
        );
    });

    afterEach(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    it('Add one product into cart', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page);

        // product popup
        await ProductPopup.addProductIntoCart(page); 

        // cart
        const count = await Cart.getProductCount(page);
        expect(count).to.equal(1);
    });

    it('Add many same products into cart', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page, 12);

        // product popup
        await ProductPopup.addProductIntoCart(page); 

        // cart
        const count = await Cart.getProductCount(page);
        expect(count).to.equal(12);
    });

    it('Add two same products into cart', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page, 2);

        // product popup
        await ProductPopup.addProductIntoCart(page); 

        // cart
        const count = await Cart.getProductCount(page);
        expect(count).to.equal(2);
    });

    it('Increase quantity on product popup', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page);

        // product popup
        await ProductPopup.addProductIntoCart(page, 2); 

        // cart
        const count = await Cart.getProductCount(page);
        expect(count).to.equal(2);
    });

    it('Increase quantity on product popup to more than 10', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page);

        // product popup
        await ProductPopup.addProductIntoCart(page, 12);

        // cart
        const count = await Cart.getProductCount(page);
        expect(count).to.equal(12);
    });

    it('Decrease quantity on product popup', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page, 2);

        // product popup
        await ProductPopup.addProductIntoCart(page, 1); 

        // cart
        const count = await Cart.getProductCount(page);
        expect(count).to.equal(1);
    });    
});