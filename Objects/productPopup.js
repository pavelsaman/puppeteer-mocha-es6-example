import Cart from './cart';


class ProductPopup {
    constructor () {
        this.addToCart = '.o-green-button.o-green-button--smaller';
        this.quantity = '#popup-product-quantity';
        this.quantityInput = 'input[id="popup-product-quantity"]';
        this.popup = '#cart-popup';
        this.goBack = '.c-popup__info-buttons-link.js-close-popup';
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
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.waitForSelector(Cart.removeProduct, { visibility: true }),
            page.waitForSelector(Cart.continue, { visibility: true }),
            page.evaluate(selector => {
                    document.querySelector(selector).click()
                }, this.addToCart
            )
        ]);
    }    
}

export default new ProductPopup();