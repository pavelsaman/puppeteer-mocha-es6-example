import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import getAllLinks from '../../Helpers/links';
import Homepage from '../../Objects/homepage';
import request from '../../Helpers/networkRequest';


const expect = chai.expect;
const baseUrl = config.baseUrl[env.envWithLang()];

describe('Tiles', () => {

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

    it('Tile links are valid', async () => {
    
        const links = await getAllLinks(page, Homepage.tileLinks);

        let i = 1;
        for (let l of links) {

            console.log('[' + i + '/' + links.size + '] ' + l);
            i++;

            let res = await request({
                method: 'GET',
                url: (l.includes('http')) ? l : baseUrl + l
            });

            expect(res.status).to.equal(200);
        }
    });
});