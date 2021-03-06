import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import Footer from '../../Objects/footer';
import getAllLinks from '../../Helpers/links';
import request from '../../Helpers/networkRequest';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

suite('Footer links', () => {

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
        await context.close();
    });

    test('Request every footer link', async () => {

        const uniqueMenuLinks = await getAllLinks(page, Footer.link);

        let i = 1; 
        for (let link of uniqueMenuLinks) {
            console.log('[' + i + '/' + uniqueMenuLinks.size + '] ' + link);
            i++;

            let res = await request({
                method: 'GET',
                url: baseUrl + link
            });
            
            expect(res.status).equal(200);
        };
    }).timeout(config.timeout * 100);
});