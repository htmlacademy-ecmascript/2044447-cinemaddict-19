import { adaptFilm } from '../utils/adapter.js';
import Observable from '../framework/observable.js';


export default class CommentsModel extends Observable{
  #commentsApiService = null;
  #comments = [];

  constructor(commentsApiService) {
    super();
    this.#commentsApiService = commentsApiService;
  }

  get comments() {
    return this.#comments;
  }

  async init(id) {
    this.#comments = await this.#commentsApiService.loadComments(id);
  }

  async addComment(updateType, { comment, film, scroll }) {
    try {
      const { comments, movie } = await this.#commentsApiService.addComment(comment, film);

      this.#comments = comments;
      const adaptedFilm = adaptFilm(movie);
      const update = {
        film: adaptedFilm,
        scroll: scroll
      };

      this._notify(updateType, update);

    } catch (err) {
      throw new Error('Can\'t add comment');
    }
  }

  async deleteComment(updateType, update) {
    const index = this.#comments.findIndex((comment) => comment.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting comment');
    }

    try {
      await this.#commentsApiService.deleteComment(update.id);
      this.#comments = this.#comments.filter((comment) => comment.id !== update.id);
      update.film.comments = this.#comments.map(({id}) => id);

      this._notify(updateType, update);
    } catch (err) {
      throw new Error('Can\'t delete comment');
    }
  }
}


