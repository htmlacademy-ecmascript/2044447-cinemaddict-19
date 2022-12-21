import AbstractView from '../framework/view/abstract-view.js';

function createFilterItemTemplate(filter, isChecked) {
  const {name, count} = filter;

  return (
    `<a href="#${name}" class="main-navigation__item ${isChecked ? 'main-navigation__item--active' : ''}">${name}
      <span class="main-navigation__item-count ">${count}</span>
     </a>`
  );

  // return (
  //   `<input
  //     type="radio"
  //     id="filter__${name}"
  //     class="filter__input visually-hidden"
  //     name="filter"
  //     ${isChecked ? 'checked' : ''}
  //     ${count === 0 ? 'disabled' : ''}
  //   />
  //   <label for="filter__${name}" class="filter__label">
  //     ${name} <span class="filter__${name}-count">${count}</span></label
  //   >`
  // );
}

function createFiltersTemplate() {

  const filterItemsTemplate = filterItems
    .map((filter, index) => createFilterItemTemplate(filter, index === 0))
    .join('');

  return (
    `<nav class="main-navigation">
      <a href="#all" class="main-navigation__item main-navigation__item--active">All movies</a>
      ${filterItemsTemplate}
    </nav>
    `
  );
}

export default class FiltersView extends AbstractView {
  #filters = null;

  constructor({filters}) {
    super();
    this.#filters = filters;
  }

  get template() {
    return createFiltersTemplate(this.#filters);
  }
}
