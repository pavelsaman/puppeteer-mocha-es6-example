
class ProfileMenu {
    constructor () {
        this.menu = '.c-user-menu__nav';
        this.myProfile = this.menu + ' > a:nth-child(1)';
        this.orders = this.menu + ' > a:nth-child(2)';
        this.addresses = this.menu + ' > a:nth-child(3)';
        this.logout = '.c-user-menu__logout';
    }
}

export default new ProfileMenu();