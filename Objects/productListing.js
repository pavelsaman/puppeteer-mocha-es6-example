

class ProductListing {
    constructor () {
        this.productItem = '.c-product-list__item';
        this.productName = this.productItem + ' > h2';
        this.coupon = '.c-product-list__item-coupon.js-product-coupon';
    }
}

export default new ProductListing();