import FBLoginPage from './fbLoginPage';


class LoginPopup {
    constructor () {
        this.popup = '#user-popup';
        this.email = '#Email';
        this.password = '#Password';
        this.logInButton = '.o-button';
        this.facebook = 'a[title="Facebook"]';        
    }

    async fillInCredentials (page, credentials, key = undefined) {
        const loginPopup = await page.$(this.popup);
        const loginEmail = await loginPopup.$(this.email);
        const loginPassword = await loginPopup.$(this.password);
        const fbButton = await loginPopup.$(this.facebook);

        if (key === 'facebook') {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                page.waitForSelector(FBLoginPage.fbAcceptCookies),
                fbButton.click()
            ]);
            await page.click(FBLoginPage.fbAcceptCookies);
            await page.type(FBLoginPage.fbEmail, credentials.name);
            await page.type(FBLoginPage.fbPassword, credentials.password);            
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