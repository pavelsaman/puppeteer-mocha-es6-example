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
        page.click(LoginPopup.popup + ' >* ' + LoginPopup.logInButton),
        page.waitForSelector(FlashMessage.info, { visibility: true })
    ]);
}

async function goIntoOrders (page) {
    // go into orders in profile
    await Promise.all([
        page.evaluate(selector => document.querySelector(selector).click(),
            Header.account
        ),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    await Promise.all([
        page.click(ProfileMenu.orders),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
}

describe('Profile orders', () => {

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
        await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    });

    afterEach(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    it('Open and close order detail', async () => {
        
        await logInWithEmail(page, credentials);
        await goIntoOrders(page);

        // open order detail
        const orders = await page.$$(UserOrders.orderItem);
        await Promise.all([
            orders[0].click(),
            page.waitForSelector(UserOrders.orderDetail)
        ]);

        // close order detail
        await orders[0].click();
        await page.waitForFunction(
            selector => !document.querySelector(selector),
            {},
            UserOrders.orderDetail
        ); 
    });

    it('Open multiple order details', async () => {
        
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

    it('Go to product detail page', async () => {
        
        await logInWithEmail(page, credentials);
        await goIntoOrders(page);

        const orders = await page.$$(UserOrders.orderItem);
        await Promise.all([
            orders[0].click(),
            page.waitForSelector(UserOrders.orderDetail)
        ]);

        const productLinks = await page.$$(UserOrders.productLink);
        await Promise.all([
            productLinks[0].click(),
            page.waitForNavigation(),
            page.waitForSelector(ProductDetail.name, { visibility: true })
        ]);
    });

    it('Product link is beautiful', async () => {
        await logInWithEmail(page, credentials);
        await goIntoOrders(page);

        const orders = await page.$$(UserOrders.orderItem);
        await Promise.all([
            orders[0].click(),
            page.waitForSelector(UserOrders.orderDetail)
        ]);

        const productLink = await page.$eval(
            UserOrders.productLink,
            selector => selector.getAttribute("href")
        );        
        expect(productLink).not.to.include('Product/Detail');
    });
});