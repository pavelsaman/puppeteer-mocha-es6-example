
class ProductSort {
    constructor () {
        this.sortingContainer = '.c-product-list__sorting-item-container';
        this.default = this.sortingContainer + ' > a:nth-child(1)';
        this.cheapest = this.sortingContainer + ' > a:nth-child(2)';
        this.mostExpensive = this.sortingContainer + ' > a:nth-child(3)';
        this.biggestDiscount = this.sortingContainer + ' > a:nth-child(4)';
    }
}

export default new ProductSort();