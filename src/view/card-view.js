import he from 'he';
import AbstractView from '../framework/view/abstract-view.js';
import { FilterType, TEXT_LIMIT, UpdateType } from '../const.js';
import { getTimeFromMins, humanizeYear } from '../utils/utils.js';

function createCardTemplate(film) {
  const {
    title,
    totalRating,
    release,
    duration,
    genre,
    poster,
    description,
  } = film.filmInfo;

  const {
    watchlist,
    alreadyWatched,
    favorite
  } = film.userDetails;

  const activeWatchlistClassName = watchlist ? 'film-card__controls-item--active' : '';
  const activeAsWatchedClassName = alreadyWatched ? 'film-card__controls-item--active' : '';
  const activeFavoriteClassName = favorite ? ' film-card__controls-item--active' : '';

  return (
    `<article class="film-card">
      <a class="film-card__link">
        <h3 class="film-card__title">${he.encode(title)}</h3>
        <p class="film-card__rating">${totalRating}</p>
        <p class="film-card__info">
          <span class="film-card__year">${he.encode(humanizeYear(release.date))}</span>
          <span class="film-card__duration">${he.encode(getTimeFromMins(duration))}</span>
          <span class="film-card__genre">${he.encode(genre.join(', '))}</span>
        </p>
        <img src="${he.encode(poster)}" alt="" class="film-card__poster">
        <p class="film-card__description">
          ${description.length > TEXT_LIMIT ? `${he.encode(description.slice(0, TEXT_LIMIT))}...` : description}
        </p>
        <span class="film-card__comments">${film.comments.length} comments</span>
      </a>
      <div class="film-card__controls">
        <button
          class="film-card__controls-item film-card__controls-item--add-to-watchlist ${activeWatchlistClassName}"
          type="button"
          data-control="${FilterType.WATCHLIST}"
          >
        Add to watchlist
        </button>

        <button
          class="film-card__controls-item film-card__controls-item--mark-as-watched ${activeAsWatchedClassName}"
          type="button"
          data-control="${FilterType.HISTORY}"
          >
        Mark as watched
        </button>

        <button
          class="film-card__controls-item film-card__controls-item--favorite ${activeFavoriteClassName}"
          type="button"
          data-control="${FilterType.FAVORITE}"
          >
        Mark as favorite
        </button>
      </div>
    </article>
    `
  );
}

export default class CardView extends AbstractView {
  #film = null;
  #handleOpenClick = null;
  #handleControlsClick = null;
  #currentFilterType = null;
  #commentId = null;

  constructor({film, commentId, onOpenClick, onControlsClick, currentFilterType}) {
    super();
    this.#film = film;
    this.#commentId = commentId;


    this.#handleOpenClick = onOpenClick;
    this.#handleControlsClick = onControlsClick;
    this.#currentFilterType = currentFilterType;

    this.element.querySelector('.film-card__link')
      .addEventListener('click', this.#handleOpenClick);

    this.element.querySelector('.film-card__controls')
      .addEventListener('click', this.#controlsClickHandler);
  }

  get template() {
    return createCardTemplate(this.#film);
  }

  #controlsClickHandler = (evt) => {
    evt.preventDefault();

    if (!evt.target.dataset.control) {
      return;
    }

    let updatedDetails = this.#film.userDetails;
    let updateType;

    switch (evt.target.dataset.control) {
      case FilterType.WATCHLIST: {
        updatedDetails = { ...updatedDetails, watchlist: !this.#film.userDetails.watchlist };
        updateType = this.#currentFilterType === FilterType.WATCHLIST ? UpdateType.MINOR : UpdateType.PATCH;
        break;
      }
      case FilterType.HISTORY: {
        updatedDetails = { ...updatedDetails, alreadyWatched: !this.#film.userDetails.alreadyWatched };
        updateType = this.#currentFilterType === FilterType.HISTORY ? UpdateType.MINOR : UpdateType.PATCH;
        break;
      }
      case FilterType.FAVORITE: {
        updatedDetails = { ...updatedDetails, favorite: !this.#film.userDetails.favorite };
        updateType = this.#currentFilterType === FilterType.FAVORITE ? UpdateType.MINOR : UpdateType.PATCH;
        break;
      }
      default:
        throw new Error('Unknown state!');
    }

    this.#handleControlsClick(updatedDetails, updateType);
  };
}
