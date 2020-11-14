import ProductPopup from './productPopup';

class ProductDetail {
    constructor () {
        this.name = '.c-product-detail-main__info-title';
        this.addToCart = '#add-to-cart';
        this.quantity = '#product-detail-quantity';
        this.quantityInput = 'input[id="product-detail-quantity"]';
        this.coupon = '.c-product-detail-main__info-tag.c-product-detail-main__info-tag--coupon.js-product-coupon';
    }

    async addProductIntoCart (page, quantity = undefined) {
        if (quantity) {
            if (quantity <= 10) {
                await page.select(this.quantity, quantity.toString());
            } else {
                await page.select(this.quantity, 'other');
                await page.type(this.quantityInput, quantity.toString());
                await page.focus(this.addToCart);
            }
        }
        
        await Promise.all([
            page.evaluate(selector => {
                    document.querySelector(selector).click()
                }, this.addToCart
            ),
            page.waitForSelector(ProductPopup.addToCart,
                { visibility: true }
            )
        ]);
    }
}

export default new ProductDetail();