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

    suite(device + ' homepage view', () => {

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
            await page.emulate(puppeteer.devices[device]);
            await page.goto(baseUrl, { waitUntil: 'networkidle0' });
        });
    
        teardown(async () => {
            await takeScreenshot(page, Date.now());
            await context.close();
        });
    
        test('Hamburger menu is visible', async () => {
        
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
    
        test('Fulltext magnifying glass is visible', async () => {
        
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
    
        test('Cart icon is visible', async () => {
        
            await page.waitForFunction(
                selector => document.querySelector(selector),
                {},
                Header.cart
            );
        });
    
        test('Open and close menu', async () => {                
            
            await Promise.all([
                page.waitForFunction(
                    selector => {
                        return document.querySelector(selector)
                            .getAttribute("class").includes('active');
                    },
                    {},
                    Menu.container
                ),
                page.click(Header.hamburger)
            ]);  
            
            await Promise.all([
                page.waitForFunction(
                    selector => {
                        return !document.querySelector(selector)
                            .getAttribute("class").includes('active');
                    },
                    {},
                    Menu.container
                ),
                page.click(Header.hamburger)
            ]);
        });
    
        test('Open and close mobile search', async () => {                
            
            await Promise.all([
                page.waitForFunction(
                    selector => {
                        return document.querySelector(selector)
                            .getAttribute("class").includes('visible');
                    },
                    {},
                    Fulltext.mobileSearch
                ),
                page.evaluate(
                    selector => document.querySelector(selector).click(),
                    Header.glass
                )
            ]);            
            
            await Promise.all([
                page.waitForFunction(
                    selector => {
                        return !document.querySelector(selector)
                            .getAttribute("class").includes('visible');
                    },
                    {},
                    Fulltext.mobileSearch
                ),
                page.evaluate(
                    selector => document.querySelector(selector).click(),
                    Header.glass
                )
            ]);
        });
    });
});

testedTables.desktopMenu.forEach(device => {
    suite(device + ' homepage view', () => {
    
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
            await page.emulate(puppeteer.devices[device]);
            await page.goto(baseUrl, { waitUntil: 'networkidle0' });
        });
    
        teardown(async () => {
            await takeScreenshot(page, Date.now());
            await context.close();
        });
    
        test('Hamburger menu is not visible', async () => {
        
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
    
        test('Fulltext magnifying glass is not visible', async () => {
        
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