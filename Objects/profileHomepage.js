

class ProfileHomepage {
    constructor () {
        this.passwordWrapper = '#password-form-wrapper';
        this.oldPassword = '#OldPassword';
        this.newPassword = '#NewPassword';
        this.confirmNewPassword = '#ConfirmNewPassword';
        this.showPasswordFields = '#password-form-link';
        this.save = '#submit-button';
    }

    async fillInPassword (page, oldPwd, newPwd, confirmNewPwd) {

        if (oldPwd) {
            await page.type(this.oldPassword, oldPwd);
        }

        if (newPwd) {
            await page.type(this.newPassword, newPwd);
        }

        if (confirmNewPwd) {
            await page.type(this.confirmNewPassword, confirmNewPwd);
        }
    }
}

export default new ProfileHomepage();