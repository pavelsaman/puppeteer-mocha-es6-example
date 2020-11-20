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
const productUrl = "panske-kalhoty-olwen-3/mpap373990";

suite('Add product into cart', () => {

    let browser, context, page;

    suiteSetup(async () => {
        browser = await puppeteer.launch(browserConfig());
    });

    suiteTeardown(async () => {
        browser.close();
    });

    setup(async () => {
        context = await browser.createIncognitoBrowserContext();
        page = await context.newPage();
        await page.goto(baseUrl + productUrl, { waitUntil: 'networkidle0' });
        await page.waitForSelector(ProductDetail.addToCart,
            { visibility: true }
        );
    });

    teardown(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    test('Add one product into cart', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page);

        // product popup
        await ProductPopup.addProductIntoCart(page); 

        // cart
        expect(page.url()).to.equal(baseUrl + 'kosik');
        expect(await Cart.getProductCount(page)).to.equal(1);
    });

    test('Add many same products into cart', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page, 12);

        // product popup
        await ProductPopup.addProductIntoCart(page); 

        // cart
        expect(page.url()).to.equal(baseUrl + 'kosik');
        expect(await Cart.getProductCount(page)).to.equal(12);
    });

    test('Add two same products into cart', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page, 2);

        // product popup
        await ProductPopup.addProductIntoCart(page); 

        // cart
        expect(page.url()).to.equal(baseUrl + 'kosik');
        expect(await Cart.getProductCount(page)).to.equal(2);
    });

    test('Increase quantity on product popup', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page);

        // product popup
        await ProductPopup.addProductIntoCart(page, 2); 

        // cart
        expect(page.url()).to.equal(baseUrl + 'kosik');
        expect(await Cart.getProductCount(page)).to.equal(2);
    });

    test('Increase quantity on product popup to more than 10', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page);

        // product popup
        await ProductPopup.addProductIntoCart(page, 12);

        // cart
        expect(page.url()).to.equal(baseUrl + 'kosik');
        expect(await Cart.getProductCount(page)).to.equal(12);
    });

    test('Decrease quantity on product popup', async () => {

        // product detail
        await ProductDetail.addProductIntoCart(page, 2);

        // product popup
        await ProductPopup.addProductIntoCart(page, 1); 

        // cart
        expect(page.url()).to.equal(baseUrl + 'kosik');
        expect(await Cart.getProductCount(page)).to.equal(1);     
    });    
});