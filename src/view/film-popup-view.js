import he from 'he';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { getTimeFromMins, humanizeReleaseDate } from '../utils/utils.js';
import {
  EMOJI,
  FilterType,
  SHAKE_ANIMATION_TIMEOUT,
  SHAKE_CLASS_NAME,
} from '../const.js';

const ClassName = {
  UPDATE_FILM: () => '.film-details__controls',
  DELETE_COMMENT: (deletingId) =>
    `.film-details__comment[data-id-deleting="${deletingId}"]`,
  ADD_COMMENT: () => '.film-details__new-comment',
};

const createCommentTemplate = (comments, isDeleting, isDisabled, deletingId) =>
  comments
    .map(
      (comment) => `
  <li class="film-details__comment" data-id-deleting="${he.encode(comment.id)}">
    <span class="film-details__comment-emoji">
      <img src="./images/emoji/${he.encode(comment.emotion)}.png" width="55" height="55" alt="emoji-smile">
    </span>
    <div>
      <p class="film-details__comment-text">${he.encode(comment.comment)}</p>
      <p class="film-details__comment-info">
        <span class="film-details__comment-author">${he.encode(comment.author)}</span>
        <span class="film-details__comment-day">${he.encode(humanizeReleaseDate(comment.date))}</span>
        <button class="film-details__comment-delete" data-id="${he.encode(comment.id)}" ${isDisabled ? 'disabled' : ''}>
        ${isDeleting && deletingId === comment.id ? 'Deleting...' : 'Delete'}
        </button>
      </p>
    </div>
  </li>
`
    ).join('');

const createNewCommentTemplate = (currentEmotion, isDisabled, isSaving) =>
  EMOJI.map(
    (emotion) => `
    <input
      class="film-details__emoji-item visually-hidden"
      name="comment-emoji"
      type="radio"
      id="emoji-${he.encode(emotion)}" value="${he.encode(emotion)}"
      ${currentEmotion === emotion ? 'checked' : ''}
      ${isDisabled ? 'disabled' : ''}
      ${isSaving ? 'disabled' : ''}
      >
    <label
      class="film-details__emoji-label"
      for="emoji-${he.encode(emotion)}">
        <img src="./images/emoji/${he.encode(emotion)}.png" width="30" height="30" alt="emoji">
    </label>
  `
  ).join('');

const createFilmPopupTemplate = (film, filmComments, state) => {
  const { emotion, comment, isDeleting, isDisabled, isSaving, deletingId } =
    state;

  const {
    title,
    alternativeTitle,
    totalRating,
    ageRating,
    duration,
    genre,
    poster,
    director,
    writers,
    actors,
    description,
    release,
  } = film.filmInfo;

  const { watchlist, alreadyWatched, favorite } = film.userDetails;

  const { date, releaseCountry } = release;

  const activeWatchlistClassName = watchlist
    ? 'film-details__control-button--active'
    : '';
  const activeAsWatchedClassName = alreadyWatched
    ? 'film-details__control-button--active'
    : '';
  const activeFavoriteClassName = favorite
    ? 'film-details__control-button--active'
    : '';

  const commentTemplate = createCommentTemplate(
    filmComments,
    isDeleting,
    isDisabled,
    deletingId
  );
  const newCommentTemplate = createNewCommentTemplate(
    emotion,
    isDisabled,
    isSaving
  );

  return `
    <section class="film-details">
      <div class="film-details__inner">
        <div class="film-details__top-container">
          <div class="film-details__close">
            <button class="film-details__close-btn" type="button">close</button>
          </div>
          <div class="film-details__info-wrap">
            <div class="film-details__poster">
              <img class="film-details__poster-img" src="${he.encode(poster)}" alt="">
              <p class="film-details__age">${ageRating}+</p>
            </div>

            <div class="film-details__info">
              <div class="film-details__info-head">
                <div class="film-details__title-wrap">
                  <h3 class="film-details__title">${he.encode(title)}</h3>
                  <p class="film-details__title-original">Original: ${he.encode(alternativeTitle)}</p>
                </div>

                <div class="film-details__rating">
                  <p class="film-details__total-rating">${totalRating}</p>
                </div>
              </div>

              <table class="film-details__table">
                <tr class="film-details__row">
                  <td class="film-details__term">Director</td>
                  <td class="film-details__cell">${he.encode(director)}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Writers</td>
                  <td class="film-details__cell">${he.encode(writers.join(', '))}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Actors</td>
                  <td class="film-details__cell">${he.encode(actors.join(', '))}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Release Date</td>
                  <td class="film-details__cell">${he.encode(humanizeReleaseDate(date))}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Duration</td>
                  <td class="film-details__cell">${he.encode(getTimeFromMins(duration))}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Country</td>
                  <td class="film-details__cell">${he.encode(releaseCountry)}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">
                    ${genre.length === 1 ? 'Genre' : 'Genres'}</td>
                  <td class="film-details__cell">
                    <span class="film-details__genre">${he.encode(genre.join(', '))}</span>
                </td>
                </tr>
              </table>

              <p class="film-details__film-description">${he.encode(description)}</p>
            </div>
          </div>

          <section class="film-details__controls">
            <button type="button"
              class="film-details__control-button film-details__control-button--watchlist ${activeWatchlistClassName}"
              id="watchlist"
              name="watchlist"
              data-control="${FilterType.WATCHLIST}"
              ${isDisabled ? 'disabled' : ''}
              >
              Add to watchlist
            </button>
            <button
              type="button"
              class="film-details__control-button film-details__control-button--watched ${activeAsWatchedClassName}"
              id="watched"
              name="watched"
              data-control="${FilterType.HISTORY}"
              ${isDisabled ? 'disabled' : ''}
              >
              Already watched
            </button>
            <button
              type="button"
              class="film-details__control-button film-details__control-button--favorite ${activeFavoriteClassName}"
              id="favorite"
              name="favorite"
              data-control="${FilterType.FAVORITE}"
              ${isDisabled ? 'disabled' : ''}
              >
              Add to favorites
            </button>
          </section>
        </div>

        <div class="film-details__bottom-container">
          <section class="film-details__comments-wrap">
            <h3 class="film-details__comments-title">Comments
              <span class="film-details__comments-count">${filmComments.length}</span>
            </h3>
            <ul class="film-details__comments-list">
              ${commentTemplate}
            </ul>
            <form class="film-details__new-comment" action="" method="get" ${isDisabled ? 'disabled' : ''}>
              <div class="film-details__add-emoji-label">
               ${emotion ?
    `<img src="./images/emoji/${he.encode(emotion)}.png" width="55" height="55" alt="emoji">` : ''}
              </div>

              <label class="film-details__comment-label">
                <textarea
                  class="film-details__comment-input"
                  placeholder="Select reaction below and write comment here"
                  name="comment">${he.encode(comment)}</textarea>
              </label>

              <div class="film-details__emoji-list">
                ${newCommentTemplate}
              </div>
            </form>
          </section>
        </div>
      </div>
    </section>
    `;
};

export default class FilmPopupView extends AbstractStatefulView {
  #film = null;
  #comments = null;
  #handleCloseClick = null;
  #handleControlsClick = null;
  #handleDeleteClick = null;

  constructor({
    film,
    comments,
    onCloseClick,
    onControlsClick,
    onDeleteClick,
  }) {
    super();
    this.#film = film;
    this.#comments = comments;
    this._setState({
      emotion: null,
      comment: '',
      isDeleting: false,
      isDisabled: false,
      isSaving: false,
      deletingId: null,
    });

    this.#handleCloseClick = onCloseClick;
    this.#handleControlsClick = onControlsClick;
    this.#handleDeleteClick = onDeleteClick;

    this._restoreHandlers();
  }

  get template() {
    const filmComments = this.filmComments;
    return createFilmPopupTemplate(this.#film, filmComments, this._state);
  }

  get filmComments() {
    const commentsSet = new Set(this.#film.comments);
    return this.#comments.filter((comment) => commentsSet.has(comment.id));
  }

  get scrollPosition() {
    return this.element.scrollTop;
  }

  scrollPopup(scrollPosition) {
    this.element.scrollTo(0, scrollPosition);
  }

  updateElement(update) {
    const scrollPosition = this.scrollPosition;
    super.updateElement(update);
    this.scrollPopup(scrollPosition);
  }

  getFormData() {
    return {
      comment: this._state.comment,
      emotion: this._state.emotion,
    };
  }

  #controlsClickHandler = (evt) => {
    evt.preventDefault();

    if (!evt.target.id) {
      return;
    }

    let updatedDetails = this.#film.userDetails;
    let activeFilter;

    switch (evt.target.dataset.control) {
      case FilterType.WATCHLIST: {
        updatedDetails = {
          ...updatedDetails,
          watchlist: !this.#film.userDetails.watchlist,
        };
        activeFilter = FilterType.WATCHLIST;
        break;
      }
      case FilterType.HISTORY: {
        updatedDetails = {
          ...updatedDetails,
          alreadyWatched: !this.#film.userDetails.alreadyWatched,
        };
        activeFilter = FilterType.HISTORY;
        break;
      }
      case FilterType.FAVORITE: {
        updatedDetails = {
          ...updatedDetails,
          favorite: !this.#film.userDetails.favorite,
        };
        activeFilter = FilterType.FAVORITE;
        break;
      }
      default:
        throw new Error('Unknown state!');
    }

    this.#handleControlsClick(
      updatedDetails,
      activeFilter,
      this.scrollPosition
    );
  };

  #setInnerHandlers = () => {
    this.element
      .querySelector('.film-details__close')
      .addEventListener('click', this.#handleCloseClick);

    this.element
      .querySelector('.film-details__controls')
      .addEventListener('click', this.#controlsClickHandler);

    this.element
      .querySelector('.film-details__emoji-list')
      .addEventListener('change', this.#emotionChangeHandler);

    this.element
      .querySelector('.film-details__comment-input')
      .addEventListener('input', this.#commentInputHandler);

    this.element
      .querySelectorAll('.film-details__comment-delete')
      .forEach((el) =>
        el.addEventListener('click', this.#commentDeleteClickHandler)
      );
  };

  _restoreHandlers() {
    this.#setInnerHandlers();
  }

  setElementAnimation(action, callback, id) {
    const element = this.element.querySelector(ClassName[action](id));
    element.classList.add(SHAKE_CLASS_NAME);

    setTimeout(() => {
      element.classList.remove(SHAKE_CLASS_NAME);
      callback();
    }, SHAKE_ANIMATION_TIMEOUT);
  }

  #emotionChangeHandler = (evt) => {
    evt.preventDefault();

    this.updateElement({
      emotion: evt.target.value,
    });
  };

  #commentInputHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      comment: evt.target.value,
    });
  };

  #commentDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick({
      id: evt.target.dataset.id,
      film: this.#film,
      scroll: this.scrollPosition,
    });
  };
}
