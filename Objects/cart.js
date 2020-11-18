
class Cart {
    constructor () {
        this.continue = '.c-cart-buttons__continue.o-button';
        this.productQuantity = '.c-step-1__item-select';
        this.removeProduct = '.c-step-1__item-remove';
        this.goShopping = 'a[href="/"]';
        this.warning = '.c-step-1__warning';
        this.steps = {
            one: new Cart1(),
            two: new Cart2(),
            three: new Cart3(),
            four: new Cart4()
        }
    }

    deleteProduct (page, nth) {
        return page.evaluate((selector, nth) => {
                document.querySelectorAll(selector)[nth].click()
            }, this.removeProduct, nth
        )
    }

    async getProductCount (page) {
        return page.evaluate(selector => {
                return parseInt(document.querySelector(selector 
                    + ' > [selected="selected"]').innerText)
            }, this.productQuantity
        );
    }
}

class Cart1 {
    constructor () {

    }
}

class Cart2 {
    constructor () {
        this.deliveryPaymentItem = 'c-step-2__item';
        this.deliveryPaymentName = 'c-step-2__item-name';
    }

    async selectDeliveryMethod (page, deliveryMethodName) {        
        const selectedDelivery
            = await page.$x('//label[@class="' 
                + this.deliveryPaymentItem 
                + '"]//div[@class="' 
                + this.deliveryPaymentName 
                + '" and text()="' 
                + deliveryMethodName + '"]');
        await selectedDelivery[0].click();
    }

    async selectPaymentMethod (page, paymentMethodName) {
        const selectedPayment
            = await page.$x('//label[@class="' 
                + this.deliveryPaymentItem 
                + '"]//div[@class="'
                + this.deliveryPaymentName 
                + '" and text()="' 
                + paymentMethodName + '"]');
        await selectedPayment[0].click();
    }
}

class Cart3 {
    constructor () {
        this.invoiceInfo = {
            firstName: '#FirstName',
            lastName: '#LastName',
            street: '#Street',
            city: '#City',
            zipCode: '#ZipCode',
            email: '#Email',
            phone: '#Phone'
        }
        this.checkbox = {
            generalTerms: '//label[@class="o-checkbox__label required" and @for="OrderConsents_0__IsChecked"]'
        }    
    }

    async fillInInvoiceInfo (page, invoiceInfo) {

        if (invoiceInfo.firstName) {
            await page.type(this.invoiceInfo.firstName, invoiceInfo.firstName);
        }

        if (invoiceInfo.lastName) {
            await page.type(this.invoiceInfo.lastName, invoiceInfo.lastName);
        }

        if (invoiceInfo.street) {
            await page.type(this.invoiceInfo.street, invoiceInfo.street);
        }

        if (invoiceInfo.city) {
            await page.type(this.invoiceInfo.city, invoiceInfo.city);
        }

        if (invoiceInfo.zipCode) {
            await page.type(this.invoiceInfo.zipCode, invoiceInfo.zipCode);
        }

        if (invoiceInfo.email) {
            await page.type(this.invoiceInfo.email, invoiceInfo.email);
        }

        if (invoiceInfo.phone) {
            await page.type(this.invoiceInfo.phone, invoiceInfo.phone);
        }
    }
}

class Cart4 {
    constructor () {
        this.strongTYTexts = '.c-thank-you__text > strong';
    }
}

export default new Cart();