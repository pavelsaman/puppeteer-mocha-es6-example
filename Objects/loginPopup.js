
class LoginPopup {
    constructor () {
        this.popup = '#user-popup';
        this.email = '#Email';
        this.password = '#Password';
        this.logInButton = '.o-button';
        this.facebook = 'a[title="Facebook"]'
        this.fbAcceptCookies = 'button[data-cookiebanner="accept_button"]';
        this.fbEmail = '#email';
        this.fbPassword = '#pass';
        this.fbLoginButton = '#loginbutton';
    }

    async fillInCredentials (page, credentials, key) {
        const loginPopup = await page.$(this.popup);
        const loginEmail = await loginPopup.$(this.email);
        const loginPassword = await loginPopup.$(this.password);
        const fbButton = await loginPopup.$(this.facebook);

        if (key === 'facebook') {
            await Promise.all([
                fbButton.click(),
                page.waitForNavigation(),
                page.waitForSelector(this.fbAcceptCookies)
            ]);
            await page.click(this.fbAcceptCookies);
            await page.type(this.fbEmail, credentials.name);
            await page.type(this.fbPassword, credentials.password);
            await Promise.all([
                page.click(this.fbLoginButton),
                page.waitForNavigation()
            ]);
        } else {
            // login popup
            if (credentials.name)
                await loginEmail.type(credentials.name);
            if (credentials.password)
                await loginPassword.type(credentials.password);
        }    
    }
}

export default new LoginPopup();