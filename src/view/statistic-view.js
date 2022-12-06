import {createElement} from '../render.js';

function createStatisticTemplate() {
  return '<p>130 291 movies inside</p>';
}

export default class StatisticView {
  getTemplate() {
    return createStatisticTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
