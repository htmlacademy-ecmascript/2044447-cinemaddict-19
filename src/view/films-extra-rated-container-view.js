import AbstractView from '../framework/view/abstract-view.js';

function createFilmsExtraRatedContainerTemplate() {
  return '<div class="films-list__container"></div>';
}
export default class FilmsExtraRatedContainerView extends AbstractView {
  get template() {
    return createFilmsExtraRatedContainerTemplate();
  }
}
