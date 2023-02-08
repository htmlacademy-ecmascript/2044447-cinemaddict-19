import { isCtrlEnterEvent, isEscapeEvent } from '../utils/utils';
import { remove, render, replace } from '../framework/render';
import { UpdateType, UserAction } from '../const';
import FilmPopupView from '../view/film-popup-view';

export default class PopupPresenter {
  #film = null;
  #filmPopupComponent = null;
  #isOpen = false;
  #filmsModel = null;
  #commentsModel = null;
  #filterModel = null;
  #handleDataChange = null;

  constructor({filmsModel, commentsModel, onDataChange, filterModel}) {
    this.#filmsModel = filmsModel;
    this.#commentsModel = commentsModel;
    this.#filterModel = filterModel;
    this.#handleDataChange = onDataChange;

    this.#filmsModel.addObserver(this.#handleModelEvent);
    this.#commentsModel.addObserver(this.#handleModelEvent);
  }

  get isOpen() {
    return this.#isOpen;
  }

  async init(film) {
    if (this.#isOpen) {
      this.#destroy();
    }

    this.#film = film;

    await this.#commentsModel.init(this.#film.id);

    this.#filmPopupComponent = new FilmPopupView({
      film: this.#film,
      comments: this.#commentsModel.comments,
      onCloseClick: this.#closePopupClickHandler,
      onControlsClick: this.#handleControlsClick,
      onDeleteClick: this.#handleDeleteClick,
    });

    render(this.#filmPopupComponent, document.body);
    document.body.classList.add('hide-overflow');
    document.addEventListener('keydown', this.#escKeyDownHandler);
    document.addEventListener('keydown', this.#commentAddHandler);
    this.#isOpen = true;
  }

  update({film, scroll = 0}) {
    if (!this.#isOpen) {
      return;
    }

    this.#film = film;
    const prevPopupComponent = this.#filmPopupComponent;

    this.#filmPopupComponent = new FilmPopupView({
      film: this.#film,
      comments: this.#commentsModel.comments,
      onCloseClick: this.#closePopupClickHandler,
      onControlsClick: this.#handleControlsClick,
      onDeleteClick: this.#handleDeleteClick,
    });

    replace(this.#filmPopupComponent, prevPopupComponent);
    this.#filmPopupComponent.scrollPopup(scroll);

    remove(prevPopupComponent);
  }

  setSaving() {
    if (!this.#isOpen) {
      return;
    }

    this.#filmPopupComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setDeleting(id) {
    if (!this.#isOpen) {
      return;
    }

    this.#filmPopupComponent.updateElement({
      isDisabled: true,
      isDeleting: true,
      deletingId: id,
    });
  }

  setAborting(action, id) {
    if (!this.#isOpen) {
      return;
    }

    const resetFormState = () => {
      this.#filmPopupComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
        deletingId: null,
      });
    };

    switch (action) {
      case UserAction.UPDATE_FILM:
        this.#filmPopupComponent.setElementAnimation(action, resetFormState);
        break;
      case UserAction.ADD_COMMENT:
        this.#filmPopupComponent.setElementAnimation(action, resetFormState);
        break;
      case UserAction.DELETE_COMMENT:
        this.#filmPopupComponent.setElementAnimation(action, resetFormState, id);
        break;
      default:
        throw new Error(`Unknown state!, ${UpdateType}`);
    }
  }

  #destroy() {
    this.#isOpen = false;
    this.#film = null;
    remove(this.#filmPopupComponent);
    document.body.classList.remove('hide-overflow');
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    document.removeEventListener('keydown', this.#commentAddHandler);
  }

  #closePopupClickHandler = () => {
    this.#destroy();
  };

  #commentAddHandler = (evt) => {
    if (isCtrlEnterEvent(evt)) {
      evt.preventDefault();
      this.#handleDataChange(UserAction.ADD_COMMENT, UpdateType.PATCH, {
        comment: this.#filmPopupComponent.getFormData(),
        film: this.#film,
        scroll: this.#filmPopupComponent.scrollPosition,
      });
    }
  };

  #handleDeleteClick = (payload) => {
    this.#handleDataChange(UserAction.DELETE_COMMENT, UpdateType.PATCH, payload);
  };

  #handleControlsClick = (
    updatedDetails,
    activeFilter,
    scrollPosition = 0
  ) => {
    const updateType = activeFilter === this.#filterModel.filter ? UpdateType.MINOR : UpdateType.PATCH;

    this.#handleDataChange(UserAction.UPDATE_FILM, updateType, {
      film: { ...this.#film, userDetails: updatedDetails },
      scroll: scrollPosition,
    });
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
      case UpdateType.MINOR:
      case UpdateType.MAJOR:
        this.update(data);
        break;
    }
  };

  #escKeyDownHandler = (evt) => {
    if (isEscapeEvent(evt)) {
      evt.preventDefault();
      this.#destroy();
    }
  };
}
