import puppeteer from 'puppeteer';
import chai from 'chai';
import config from '../../config';
import * as env from '../../Helpers/env';
import browserConfig from '../../Helpers/browserOptions';
import takeScreenshot from '../../Helpers/screenshot';
import LoginPopup from '../../Objects/loginPopup';
import Header from '../../Objects/header';
import credentials from '../../Resources/credentials.json';
import FlashMessage from '../../Objects/flashMessage';
import ProfileHomepage from '../../Objects/profileHomepage';
import ProfileMenu from '../../Objects/profileMenu';


const baseUrl = config.baseUrl[env.envWithLang()];
const newPassword = '123456a';

async function saveBtnIsEnabled (page) {
    return page.waitForFunction(
        selector => {
            const save = document.querySelector(selector);
            if (save) {
                const attr = !save.hasAttribute('disabled');
                const classOption 
                    = !save.getAttribute('class').includes('disabled');
                if (attr && classOption)
                    return true;
            }
            return false;
        },
        {},
        ProfileHomepage.save
    );
}

async function saveBtnIsDisabled (page) {
    return page.waitForFunction(
        selector => {
            const save = document.querySelector(selector);
            if (save) {
                const attr = save.hasAttribute('disabled');
                const classOption 
                    = save.getAttribute('class').includes('disabled');
                if (attr || classOption)
                    return true;
            }
            return false;
        },
        {},
        ProfileHomepage.save
    );
}

async function passwordFieldsAreVisible (page) {
    return page.waitForFunction(
        selector => {
            const wrap = document.querySelector(selector);
            if (wrap)
                return wrap.getAttribute('class').includes('visible');
            return false;
        },
        {},
        ProfileHomepage.passwordWrapper
    )
}

async function passwordFieldsAreNotVisible (page) {
    return page.waitForFunction(
        selector => {
            const wrap = document.querySelector(selector);
            if (wrap)
                return !wrap.getAttribute('class').includes('visible');
            return false;
        },
        {},
        ProfileHomepage.passwordWrapper
    )
}

async function flashIsVisible (page, selector) {
    return page.waitForFunction(
        selector => {
            return document.querySelector(selector);
        },
        {},
        selector
    );
}

describe('User password', () => {

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

    it('Change user password', async () => {

        // log in
        await page.click(Header.account);
        await LoginPopup.fillInCredentials(page, credentials.email);
        await Promise.all([
            page.click(LoginPopup.logInButton),
            flashIsVisible(page, FlashMessage.info)
        ]);        

        // go to user profile, password fields are hidden, save btn is disabled
        await Promise.all([
            page.evaluate(
                selector => {
                    document.querySelector(selector).click()
                },
                Header.account
            ),
            page.waitForNavigation({ waitUntil: 'networkidle0'}),
            passwordFieldsAreNotVisible(page),
            saveBtnIsDisabled(page)
        ]);

        // display password fields, send btn is enabled
        await Promise.all([
            page.click(ProfileHomepage.showPasswordFields),
            passwordFieldsAreVisible(page),
            saveBtnIsEnabled(page)
        ]);

        // fill in new password
        await ProfileHomepage.fillInPassword(
            page,
            credentials.email.password,
            newPassword,
            newPassword
        );
        await Promise.all([
            page.click(ProfileHomepage.save),
            flashIsVisible(page, FlashMessage.info),
            passwordFieldsAreNotVisible(page),
            saveBtnIsDisabled(page)
        ]);

        // log out
        await Promise.all([
            page.evaluate(
                selector => {
                    document.querySelector(selector).click()
                },
                ProfileMenu.logout
            ),
            page.waitForNavigation({ waitUntil: 'networkidle0'}),
            flashIsVisible(page, FlashMessage.info)
        ]);

        // cannot login with old pwd
        await page.click(Header.account);
        await LoginPopup.fillInCredentials(page, credentials.email);
        await Promise.all([
            page.click(LoginPopup.logInButton),
            flashIsVisible(page, FlashMessage.warning)
        ]);

        // change pwd back
        await page.evaluate(
            selector => {
                document.querySelector(selector).click()
            },
            Header.account
        );
        const newCredentials = {
            name: credentials.email.name,
            password: newPassword
        };
        await LoginPopup.fillInCredentials(page, newCredentials);
        await Promise.all([
            page.click(LoginPopup.logInButton),
            flashIsVisible(page, FlashMessage.info)
        ]);
        await Promise.all([
            page.evaluate(
                selector => {
                    document.querySelector(selector).click()
                },
                Header.account
            ),
            page.waitForNavigation({ waitUntil: 'networkidle0'})
        ]);
        await page.click(ProfileHomepage.showPasswordFields);
        await ProfileHomepage.fillInPassword(
            page,
            newPassword,
            credentials.email.password,
            credentials.email.password
        );
        await Promise.all([
            page.click(ProfileHomepage.save),
            flashIsVisible(page, FlashMessage.info)
        ]);
        await page.evaluate(
            selector => {
                document.querySelector(selector).click()
            },
            ProfileMenu.logout
        );
    });
});