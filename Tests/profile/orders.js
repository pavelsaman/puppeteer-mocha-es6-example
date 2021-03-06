import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import credentials from '../../Resources/credentials.json';
import LoginPopup from '../../Objects/loginPopup';
import Header from '../../Objects/header';
import ProfileMenu from '../../Objects/profileMenu';
import FlashMessage from '../../Objects/flashMessage';
import UserOrders from '../../Objects/userOrders';
import ProductDetail from '../../Objects/productDetail';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

async function logInWithEmail (page, credentials) {
    // home page
    await page.waitForSelector(Header.account, { visibility: true });
    await Promise.all([
        page.click(Header.account),
        page.waitForSelector(LoginPopup.popup, { visibility: true })
    ]);

    // login popup        
    await LoginPopup.fillInCredentials(page, credentials.email);
    await Promise.all([
        page.waitForSelector(FlashMessage.info, { visibility: true }),
        page.click(LoginPopup.popup + ' >* ' + LoginPopup.logInButton)
    ]);
}

async function goIntoOrders (page) {
    // go into orders in profile
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.evaluate(selector => document.querySelector(selector).click(),
            Header.account
        )
    ]);
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click(ProfileMenu.orders)
    ]);
}

suite('Profile orders', () => {

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
    });

    teardown(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    test('Open and close order detail', async () => {
        
        await logInWithEmail(page, credentials);
        await goIntoOrders(page);

        // open order detail
        const orders = await page.$$(UserOrders.orderItem);
        await Promise.all([
            page.waitForSelector(UserOrders.orderDetail),
            orders[0].click()
        ]);

        // close order detail
        await orders[0].click();
        await page.waitForFunction(
            selector => !document.querySelector(selector),
            {},
            UserOrders.orderDetail
        ); 
    });

    test('Open multiple order details', async () => {
        
        await logInWithEmail(page, credentials);
        await goIntoOrders(page);

        // open order details
        const max = 5;
        let orders = await page.$$(UserOrders.orderItem);
        for (let i = 0; i < max; i++) {  
            await orders[i].click();          
            await page.waitForFunction(
                (selector, size) => document.querySelectorAll(selector).length 
                    === size,
                {},
                UserOrders.orderDetail,
                i + 1
            );
        }

        await page.waitForFunction(
            (selector, size) => document.querySelectorAll(selector).length 
                === size,
            {},
            UserOrders.orderDetail,
            max
        );
    });

    test('Go to product detail page', async () => {
        
        await logInWithEmail(page, credentials);
        await goIntoOrders(page);

        const orders = await page.$$(UserOrders.orderItem);
        await Promise.all([
            page.waitForSelector(UserOrders.orderDetail),
            orders[0].click()
        ]);

        const productLinks = await page.$$(UserOrders.productLink);
        await Promise.all([
            page.waitForNavigation(),
            page.waitForSelector(ProductDetail.name, { visibility: true }),
            productLinks[0].click()
        ]);
    });

    test('Product link is beautiful', async () => {
        await logInWithEmail(page, credentials);
        await goIntoOrders(page);

        const orders = await page.$$(UserOrders.orderItem);
        await Promise.all([
            page.waitForSelector(UserOrders.orderDetail),
            orders[0].click()
        ]);

        const productLink = await page.$eval(
            UserOrders.productLink,
            selector => selector.getAttribute("href")
        );        
        expect(productLink).not.to.include('Product/Detail');
    });
});