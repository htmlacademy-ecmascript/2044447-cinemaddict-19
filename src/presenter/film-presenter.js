import CardView from '../view/card-view.js';
import { isEscapeEvent, isCtrlEnterEvent } from '../utils/utils.js';
import { UpdateType, UserAction } from '../const.js';
import FilmPopupView from '../view/film-popup-view.js';
import { render, replace, remove } from '../framework/render.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  OPEN: 'OPEN',
};

export default class FilmPresenter {
  #filmListContainer = null;

  #filmComponent = null;
  #filmPopup = null;

  #film = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #currentFilterType = null;
  #commentsModel = null;
  #mode = Mode.DEFAULT;

  constructor({filmListContainer, onDataChange, onModeChange, currentFilterType, commentsModel}) {
    this.#filmListContainer = filmListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
    this.#currentFilterType = currentFilterType;
    this.#commentsModel = commentsModel;
  }

  init(film, scrollPosition = 0) {
    this.#film = film;

    const prevFilmComponent = this.#filmComponent;
    const prevPopupComponent = this.#filmPopup;

    this.#filmComponent = new CardView({
      film: film,
      comments: this.#commentsModel,
      onOpenClick: () => this.#openPopupClickHandler(film),
      onControlsClick: this.#handleControlsClick,
      currentFilterType: this.#currentFilterType,
    });

    if (prevFilmComponent === null) {
      render(this.#filmComponent, this.#filmListContainer);
    } else {
      replace(this.#filmComponent, prevFilmComponent);
    }

    if (this.#mode === Mode.OPEN) {
      this.#filmPopup = new FilmPopupView({
        film: film,
        comments: this.#commentsModel.comments,
        onCloseClick: () => this.#closePopupClickHandler(film),
        onControlsClick: this.#handleControlsClick,
        currentFilterType: this.#currentFilterType,
        onDeleteClick: this.#handleDeleteClick,
      });

      replace(this.#filmPopup, prevPopupComponent);
      this.#filmPopup.scrollPopup(scrollPosition);
    }

    remove(prevFilmComponent);
    remove(prevPopupComponent);
  }

  destroy() {
    remove(this.#filmComponent);
    remove(this.#filmPopup);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#closePopupClickHandler();
    }
  }

  setSaving() {
    if (this.#mode === Mode.OPEN) {
      this.#filmPopup.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting(id) {
    if (this.#mode === Mode.OPEN) {
      this.#filmPopup.updateElement({
        isDisabled: true,
        isDeleting: true,
        deletingId: id,
      });
    }
  }

  setAborting(action, id) {
    if (this.#mode === Mode.DEFAULT) {
      this.#filmComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#filmPopup.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
        deletingId: null,
      });
    };

    switch(action) {
      case UserAction.UPDATE_FILM:
        this.#filmPopup.setElementAnimation(action, resetFormState);
        break;
      case UserAction.ADD_COMMENT:
        this.#filmPopup.setElementAnimation(action, resetFormState);
        break;
      case UserAction.DELETE_COMMENT:
        this.#filmPopup.setElementAnimation(action, resetFormState, id);
        break;
      default:
        throw new Error(`Unknown state!, ${UpdateType}`);
    }
  }

  #handleControlsClick = (updatedDetails, updateType = UpdateType.PATCH, scrollPosition = 0) => {
    this.#handleDataChange(
      UserAction.UPDATE_FILM,
      updateType,
      {
        film: {...this.#film, userDetails: updatedDetails},
        scroll: scrollPosition
      },
    );
  };

  async #openPopupClickHandler(film) {
    await this.#commentsModel.init(film.id);
    this.#filmPopup = new FilmPopupView({
      film: film,
      comments: this.#commentsModel.comments,
      onCloseClick: () => this.#closePopupClickHandler(film),
      onControlsClick: this.#handleControlsClick,
      currentFilterType: this.#currentFilterType,
      onDeleteClick: this.#handleDeleteClick,
    });
    this.#appendPopup();
  }


  #appendPopup() {
    this.#handleModeChange();
    document.body.appendChild(this.#filmPopup.element);
    document.body.classList.add('hide-overflow');
    document.addEventListener('keydown', this.#escKeyDownHandler);
    document.addEventListener('keydown', this.#commentAddHandler);
    this.#mode = Mode.OPEN;
  }

  #removePopup() {
    document.body.removeChild(this.#filmPopup.element);
    document.body.classList.remove('hide-overflow');
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    document.removeEventListener('keydown', this.#commentAddHandler);
    this.#mode = Mode.DEFAULT;
  }

  #closePopupClickHandler = () => {
    this.#removePopup();
  };

  #commentAddHandler = (evt) => {
    if (isCtrlEnterEvent(evt)) {
      evt.preventDefault();
      this.#handleDataChange(
        UserAction.ADD_COMMENT,
        UpdateType.PATCH,
        {comment: this.#filmPopup.getFormData(), film: this.#film, scroll: this.#filmPopup.scrollPosition}
      );
    }
  };

  #escKeyDownHandler = (evt) => {
    if (isEscapeEvent(evt)) {
      evt.preventDefault();
      this.#closePopupClickHandler();
    }
  };

  #handleDeleteClick = (id) => {
    this.#handleDataChange(
      UserAction.DELETE_COMMENT,
      UpdateType.PATCH,
      id,
    );
  };
}
