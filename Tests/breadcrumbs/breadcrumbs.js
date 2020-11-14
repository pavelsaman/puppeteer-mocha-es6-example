import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import Breadcrumbs from '../../Objects/breadcrumbs';
import request from '../../Helpers/networkRequest';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];
const urls = [
    "damska-mikina-cussa/lswp203779",
    "alpine-pro-otevira-novou-prodejnu"
];

describe('Breadcrumbs', () => {

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
    });

    afterEach(async () => {
        await takeScreenshot(page, Date.now());
        await context.close();
    });

    urls.forEach(link => {
        it('Navigate breadcrumbs from: ' + link, async () => {
            await page.goto(baseUrl + link, { waitUntil: 'networkidle0' });
            const breadcrumbLinks = await page.$$eval(
                Breadcrumbs.item,
                selector => selector.map(s => s.getAttribute("href"))
            );
            
            for (let l of breadcrumbLinks) {
                let res = await request({
                    method: 'GET',
                    url: baseUrl + l
                });
    
                expect(res.status).to.equal(200);
            }
        });
    });
});