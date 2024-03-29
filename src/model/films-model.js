import { UpdateType } from '../const.js';
import { adaptFilm } from '../utils/adapter.js';
import Observable from '../framework/observable.js';

export default class FilmsModel extends Observable {
  #filmsApiService = null;
  #films = [];

  constructor({filmsApiService}) {
    super();
    this.#filmsApiService = filmsApiService;
  }

  get films() {
    return this.#films;
  }

  async init() {
    try {
      const films = await this.#filmsApiService.films;
      this.#films = films.map(this.#adaptToClient);
    } catch(err) {
      this._notify(UpdateType.INIT_ERROR);
      throw err;
    }
    this._notify(UpdateType.INIT);
  }

  async updateFilm(updateType, { film, scroll }) {

    const index = this.#films.findIndex((movie) => movie.id === film.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting film');
    }

    try {
      const response = await this.#filmsApiService.updateFilm(film);
      const updatedFilm = this.#adaptToClient(response);

      const update = {
        film: updatedFilm,
        scroll,
      };

      this.#films = [
        ...this.#films.slice(0, index),
        updatedFilm,
        ...this.#films.slice(index + 1),
      ];

      this._notify(updateType, update);
    } catch(err) {
      throw new Error('Can\'t update film');
    }
  }

  #adaptToClient(film) {
    return adaptFilm(film);
  }
}
