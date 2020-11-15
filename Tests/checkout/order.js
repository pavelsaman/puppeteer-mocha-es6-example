import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import ProductDetail from '../../Objects/productDetail';
import ProductPopup from '../../Objects/productPopup';
import Cart from '../../Objects/cart';
import SummaryBox from '../../Objects/summaryBox';


const orderData = require('../../Resources/' + env.env() + '/' 
    + env.lang() + '/order.json');
const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];
const productUrl = "damska-mikina-cussa/lswp203828";

function waitForSelected (page, el, text) {
    return page.waitForFunction(
        (selector, text) => {
            let els = document.querySelectorAll(selector);
            for (let el of els) {
                if (el.innerText === text)
                    return true;
            }
            return false;
        },
        {},
        el,
        text
    );
}

describe('Create order', () => {

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

    orderData.forEach(data => {
        it('Create order', async () => {
            
            await page.goto(baseUrl + productUrl, 
                { waitUntil: 'networkidle0' }
            );
            await ProductDetail.addProductIntoCart(page, 1);
            await ProductPopup.addProductIntoCart(page, 1);

            // cart 2
            await Promise.all([
                page.click(Cart.continue),
                page.waitForNavigation({ waitUntil: 'networkidle0' })
            ]);
            await Promise.all([
                Cart.steps.two.selectDeliveryMethod(page, data.deliveryMethod),
                waitForSelected(
                    page, 
                    SummaryBox.deliveryName, 
                    data.deliveryMethod
                )
            ]);
            await Promise.all([
                Cart.steps.two.selectPaymentMethod(page, data.paymentMethod),
                waitForSelected(
                    page, 
                    SummaryBox.paymentName, 
                    data.paymentMethod
                )
            ]);

            // cart 3
            await Promise.all([
                page.click(Cart.continue),
                page.waitForNavigation({ waitUntil: 'networkidle0' })
            ]);
            await Cart.steps.three.fillInInvoiceInfo(page, data);
            await page.$x(Cart.steps.three.checkbox.generalTerms)
                .then(els => els[0].click());

            // cart 4 == TY page
            await Promise.all([
                page.click(Cart.continue),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                page.waitForFunction(
                    (selector, lang) => {
                        const strongTexts = document.querySelectorAll(selector);
                        if (!strongTexts || strongTexts.length === 0)
                            return false;
                        const orderNumber = strongTexts[1].innerText;
                        if (lang === "cz") {
                            if (orderNumber.match(/^[0-9]{2}0[0-9]{5}$/))
                                return true;
                        } else {
                            if (orderNumber.match(/^[0-9]{2}1[0-9]{5}$/))
                                return true;
                        }
                        
                        return false;
                    },
                    {},
                    Cart.steps.four.strongTYTexts,
                    env.lang()
                )
            ]);

        }).timeout(config.timeout + 15000);
    }); 
});