
class Cart {
    constructor () {
        this.continue = '.c-cart-buttons__continue.o-button';
        this.productQuantity = '.c-step-1__item-select';
        this.removeProduct = '.c-step-1__item-remove';
        this.goShopping = 'a[href="/"]';
        this.warning = '.c-step-1__warning';
    }

    deleteProduct (page, nth) {
        return page.evaluate((selector, nth) => {
                document.querySelectorAll(selector)[nth].click()
            }, this.removeProduct, nth
        )
    }

    async getProductCount (page) {
        return await page.evaluate(selector => {
                return parseInt(document.querySelector(selector 
                    + ' > [selected="selected"]').innerText)
            }, this.productQuantity
        );
    }
}

export default new Cart();