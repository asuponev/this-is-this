import BaseComponent from '../base-component';
import Button from '../button/button';
import { Price, ProductData, TypedMoney } from '@commercetools/platform-sdk';
import formatPrice from '../../services/formatPrice';
import './product.scss';
import userStore from '../../store/user-store';
import createAnonymusCart from '../../services/createAnonymusCart';
import Notification from '../notification/notification';
import getActiveCart from '../../services/getActiveCart';

interface ProductAttributes {
  [name: string]: string;
}

export default class Product extends BaseComponent<'div'> {
  private addToCartBtn: HTMLButtonElement = new Button('button', 'Cart').getElement();
  private productData: ProductData | null = null;
  private productAttributes: ProductAttributes = {
    rating: '-',
    reviews: '0',
    days: 'Please ask about tour duration by writing to us at this.is.this@gmail.com',
    inStock: 'Please check availability by writing to us at this.is.this@gmail.com',
    location: 'Paradise',
    shortDescription: 'No information about this tour',
    adventureStyle: 'Relax',
    aboutTour: 'No information about this tour',
  };
  private productId: string;
  private isCart: boolean = false;

  constructor(productId: string, productData: ProductData) {
    super('div', ['product']);

    this.productData = productData;
    this.productId = productId;

    this.createMarkup();
  }

  private async checkProductInCart(): Promise<void> {
    const { isAuth } = userStore.getState();
    let token: string | null;

    if (!isAuth) {
      token = localStorage.getItem('tokenAnon');

      if (!token) {
        await createAnonymusCart();
        token = localStorage.getItem('tokenAnon');

        if (!token) {
          new Notification(
            'error',
            'Something went wrong! Please try to log in or try again later.'
          ).showNotification();
          return;
        }
      }
    } else {
      token = localStorage.getItem('token');
      if (!token) {
        new Notification('error', 'Something went wrong! Please try to log in or try again later.').showNotification();
        return;
      }
    }

    try {
      const response = await getActiveCart(token);

      const productsInCart = response.lineItems;

      productsInCart.forEach((item) => {
        if (item.productId === this.productId) this.isCart = true;
      });

      console.log(this.isCart);
    } catch (err) {
      return;
    }
  }

  private async createMarkup(): Promise<void> {
    await this.checkProductInCart();
    this.getProductAttributes();

    const productInfo = this.drawProductInfo();
    const productForm = this.drawProductForm();
    const productAbout = this.drawProductAbout();

    this.node.append(productInfo, productForm, productAbout);
  }

  private drawProductPrice(): HTMLDivElement {
    const productPrices = new BaseComponent('div', ['product__prices']).getElement();

    const prices: Price[] | undefined = this.productData?.masterVariant.prices;

    if (prices?.length) {
      const standardPrice: TypedMoney = prices[0].value;
      const discountedPrice: TypedMoney | undefined = prices[0].discounted?.value;

      const productPrice = new BaseComponent(
        'span',
        ['product-card__price'],
        formatPrice(standardPrice.currencyCode, standardPrice.centAmount, standardPrice.fractionDigits)
      ).getElement();

      productPrices.append(productPrice);

      if (discountedPrice) {
        const productDiscountedPrice = new BaseComponent(
          'span',
          ['product-card__price', 'product-card__price--new'],
          formatPrice(discountedPrice.currencyCode, discountedPrice.centAmount, discountedPrice.fractionDigits)
        ).getElement();

        productPrice.classList.add('product-card__price--old');
        productPrices.append(productDiscountedPrice);
      }
    }

    return productPrices;
  }

  private drawProductInfo(): HTMLDivElement {
    const title = this.productData?.name.en || 'Unnamed tour';
    const { rating, reviews, inStock, shortDescription, adventureStyle } = this.productAttributes;

    const productRoutes = new BaseComponent('p', ['product__routes'], adventureStyle).getElement();
    const productInfo = new BaseComponent('div', ['product__info']).getElement();
    const productOpinion = new BaseComponent('div', ['product__opinion']).getElement();
    const productTitle = new BaseComponent('h2', ['product__title'], title).getElement();
    const productPrice = this.drawProductPrice();
    const productRating = new BaseComponent('p', ['product__rating'], rating).getElement();
    const productReviews = new BaseComponent('p', ['product__reviews'], `${reviews}+ Reviews`).getElement();
    const productDescription = new BaseComponent('p', ['product__description'], shortDescription).getElement();
    const productStock = new BaseComponent('p', ['product__stock'], `${inStock} In Stock`).getElement();

    productOpinion.append(productRating, productReviews);
    productInfo.append(productRoutes, productTitle, productPrice, productOpinion, productDescription, productStock);

    return productInfo;
  }

  private getProductAttributes(): void {
    const attributes = this.productData?.masterVariant.attributes;

    if (attributes) {
      for (const key of attributes) {
        if (key.name in this.productAttributes) {
          this.productAttributes[key.name] = key.value;
        }
      }
    }
  }

  private drawProductForm(): HTMLDivElement {
    const productForm = new BaseComponent('div', ['product__add-to-cart']).getElement();

    this.addToCartBtn = this.drawButton();

    productForm.append(this.addToCartBtn);

    return productForm;
  }

  private drawButton(): HTMLButtonElement {
    if (this.isCart) {
      return new Button('button', 'Remove From Cart', ['button--white'], false, () =>
        this.removeFromCart()
      ).getElement();
    }

    return new Button('button', 'Add To Cart', [], false, () => this.addToCart()).getElement();
  }

  private drawProductAbout(): HTMLUListElement {
    const { aboutTour, location } = this.productAttributes;

    const productAbout = new BaseComponent('ul', ['product__about']).getElement();
    const productAboutItem = new BaseComponent('li', ['product__about-item'], 'About Tour').getElement();
    const productLocationItem = new BaseComponent('li', ['product__about-item'], 'Location').getElement();

    aboutTour
      .slice(0, -1)
      .split('.')
      .forEach((sentence) => {
        const aboutTourSentence = new BaseComponent('p', ['product__description'], `${sentence}.`).getElement();

        productAboutItem.append(aboutTourSentence);
      });

    const productLocation = new BaseComponent('p', ['product__description'], location).getElement();

    productLocationItem.append(productLocation);
    productAbout.append(productAboutItem, productLocationItem);

    return productAbout;
  }

  private addToCart(): void {
    console.log(`TODO: create func add to cart. Product ID: ${this.productId}`);
  }

  private removeFromCart() {
    console.log('TODO REMOVE FROM CART');
  }
}
