import Cart from './cart';


class ProductPopup {
    constructor () {
        this.addToCart = '.o-green-button.o-green-button--smaller';
        this.quantity = '#popup-product-quantity';
        this.quantityInput = 'input[id="popup-product-quantity"]'
    }

    async addProductIntoCart (page, quantity = undefined) {
        if (quantity)
            if (quantity <= 10) {
                await page.select(this.quantity, quantity.toString());
            } else {
                await page.select(this.quantity, 'other');
                await page.type(this.quantityInput, quantity.toString());
                await page.focus(this.addToCart);
            }
        
        await Promise.all([
            page.evaluate(selector => {
                    document.querySelector(selector).click()
                }, this.addToCart
            ),
            page.waitForSelector(Cart.removeProduct, { visibility: true }),
            page.waitForSelector(Cart.continue, { visibility: true })
        ]);
    }
}

export default new ProductPopup();