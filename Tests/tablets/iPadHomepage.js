import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import Header from '../../Objects/header';
import Menu from '../../Objects/menu';
import Fulltext from '../../Objects/fulltext';
import testedTables from '../../Resources/testedTables.json';


const baseUrl = config.baseUrl[env.envWithLang()];

testedTables.mobileMenu.forEach(device => {

    describe(device + ' homepage view', () => {

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
            await page.emulate(puppeteer.devices[device]);
            await page.goto(baseUrl, { waitUntil: 'networkidle0' });
        });
    
        afterEach(async () => {
            await takeScreenshot(page, Date.now());
            await context.close();
        });
    
        it('Hamburger menu is visible', async () => {
        
            await page.waitForFunction(
                selector => {
                    let hamburger = document.querySelector(selector);
                    return window.getComputedStyle(hamburger)
                        .getPropertyValue('display') !== "none";
                },
                {},
                Header.hamburger
            );
        });
    
        it('Fulltext magnifying glass is visible', async () => {
        
            await page.waitForFunction(
                selector => {
                    let hamburger = document.querySelector(selector);
                    return window.getComputedStyle(hamburger)
                        .getPropertyValue('display') === "block";
                },
                {},
                Header.glass
            );
        });
    
        it('Cart icon is visible', async () => {
        
            await page.waitForFunction(
                selector => document.querySelector(selector),
                {},
                Header.cart
            );
        });
    
        it('Open and close menu', async () => {                
            
            await Promise.all([
                page.click(Header.hamburger),
                page.waitForFunction(
                    selector => {
                        return document.querySelector(selector)
                            .getAttribute("class").includes('active');
                    },
                    {},
                    Menu.container
                )
            ]);  
            
            await Promise.all([
                page.click(Header.hamburger),
                page.waitForFunction(
                    selector => {
                        return !document.querySelector(selector)
                            .getAttribute("class").includes('active');
                    },
                    {},
                    Menu.container
                )
            ]);
        });
    
        it('Open and close mobile search', async () => {                
            
            await Promise.all([
                page.evaluate(
                    selector => document.querySelector(selector).click(),
                    Header.glass
                ),
                page.waitForFunction(
                    selector => {
                        return document.querySelector(selector)
                            .getAttribute("class").includes('visible');
                    },
                    {},
                    Fulltext.mobileSearch
                )
            ]);            
            
            await Promise.all([
                page.evaluate(
                    selector => document.querySelector(selector).click(),
                    Header.glass
                ),
                page.waitForFunction(
                    selector => {
                        return !document.querySelector(selector)
                            .getAttribute("class").includes('visible');
                    },
                    {},
                    Fulltext.mobileSearch
                )
            ]);
        });
    });
});

testedTables.desktopMenu.forEach(device => {
    describe(device + ' homepage view', () => {
    
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
            await page.emulate(puppeteer.devices[device]);
            await page.goto(baseUrl, { waitUntil: 'networkidle0' });
        });
    
        afterEach(async () => {
            await takeScreenshot(page, Date.now());
            await context.close();
        });
    
        it('Hamburger menu is not visible', async () => {
        
            await page.waitForFunction(
                selector => {
                    let hamburger = document.querySelector(selector);
                    return window.getComputedStyle(hamburger)
                        .getPropertyValue('display') === "none";
                },
                {},
                Header.hamburger
            );
        });
    
        it('Fulltext magnifying glass is not visible', async () => {
        
            await page.waitForFunction(
                selector => {
                    let hamburger = document.querySelector(selector);
                    return window.getComputedStyle(hamburger)
                        .getPropertyValue('display') !== "block";
                },
                {},
                Header.glass
            );
        });
    });
});