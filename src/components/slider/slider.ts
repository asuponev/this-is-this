import Swiper from 'swiper';
import BaseComponent from '../base-component';
import { Image } from '@commercetools/platform-sdk';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css';
import './slider.scss';

export default class ProductSlider extends BaseComponent<'div'> {
  private images: Image[];
  private sliderView: HTMLElement;
  private sliderList: HTMLElement;
  private sliderBtnNext: HTMLElement;
  private sliderBtnPrev: HTMLElement;
  private modalWindow: HTMLElement;

  constructor(images: Image[]) {
    super('div', ['product__slider']);
    this.images = images;

    const mainComponents = this.initMainComponents();
    this.sliderView = mainComponents.sliderView;
    this.sliderList = mainComponents.sliderList;
    this.sliderBtnNext = mainComponents.sliderBtnNext;
    this.sliderBtnPrev = mainComponents.sliderBtnPrev;
    this.modalWindow = new BaseComponent('div', ['popup', 'open']).getElement();
    this.modalWindow.addEventListener('click', this.onBackdropClick.bind(this));

    this.createMarkup();
  }

  private initMainComponents() {
    const sliderView = new BaseComponent('div', ['swiper', 'swiper-view']).getElement();
    const sliderBtnNext = new BaseComponent('div', ['swiper-button-next']).getElement();
    const sliderBtnPrev = new BaseComponent('div', ['swiper-button-prev']).getElement();
    const sliderList = new BaseComponent('div', ['swiper', 'swiper-list']).getElement();

    return {
      sliderView,
      sliderBtnNext,
      sliderBtnPrev,
      sliderList,
    };
  }

  private createMarkup(): void {
    const swiperViewWrapper = new BaseComponent('div', ['swiper-wrapper']).getElement();
    this.setOpenListener(swiperViewWrapper);

    const swiperListWrapper = new BaseComponent('div', ['swiper-wrapper']).getElement();

    for (let i = 0; i < this.images.length; i++) {
      const imageViewContainer = new BaseComponent('div', ['swiper-slide']).getElement();
      const imageView = new BaseComponent('img').getElement();
      imageView.src = this.images[i].url;

      const imageListContainer = new BaseComponent('div', ['swiper-slide']).getElement();
      const imageList = new BaseComponent('img').getElement();
      imageList.src = this.images[i].url;

      imageViewContainer.append(imageView);
      imageListContainer.append(imageList);

      swiperViewWrapper.append(imageViewContainer);
      swiperListWrapper.append(imageListContainer);
    }

    this.sliderView.append(swiperViewWrapper, this.sliderBtnNext, this.sliderBtnPrev);
    this.sliderList.append(swiperListWrapper);

    this.node.append(this.sliderView, this.sliderList);

    this.initSwiper();
  }

  private initSwiper() {
    const swiperList = new Swiper(this.sliderList, {
      loop: true,
      spaceBetween: 10,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
    });

    new Swiper(this.sliderView, {
      loop: true,
      spaceBetween: 24,
      modules: [Navigation, Thumbs],
      navigation: {
        nextEl: this.sliderBtnNext,
        prevEl: this.sliderBtnPrev,
      },
      thumbs: {
        swiper: swiperList,
      },
    });
  }

  private setOpenListener(element: HTMLElement) {
    element.addEventListener('click', (event) => {
      event.preventDefault();

      if (event.target instanceof HTMLElement) {
        const firstSlide: HTMLElement | null = event.target.closest('.swiper-slide-active');
        const imageIndex = Number(firstSlide?.getAttribute('data-swiper-slide-index') || 0);

        this.openModal(imageIndex);
      }
    });
  }

  private openModal(index: number): void {
    const modalSliderContainer = new BaseComponent('div', ['product__slider_modal']).getElement();
    const modalSliderView = <HTMLElement>this.sliderView.cloneNode(true);

    modalSliderContainer.append(modalSliderView);
    this.modalWindow.append(modalSliderContainer);

    document.body.append(this.modalWindow);

    new Swiper(modalSliderView, {
      loop: true,
      spaceBetween: 24,
      modules: [Navigation],
      navigation: {
        nextEl: '.popup .swiper-button-next',
        prevEl: '.popup .swiper-button-prev',
      },
      initialSlide: index,
    });
  }

  onBackdropClick(event: MouseEvent): void {
    event.preventDefault();

    if (event.target instanceof HTMLElement) {
      if (event.target.classList.contains('popup')) this.removeModalWindow();
    }
  }

  private removeModalWindow(): void {
    this.modalWindow.innerHTML = '';
    this.modalWindow.remove();
  }
}
