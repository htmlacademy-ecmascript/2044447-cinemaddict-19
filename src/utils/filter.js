import { FilterType } from '../const.js';

const filter = {
  // [FilterType.ALL]: (films) => films.filter((film) => film === film),
  [FilterType.WATCHLIST]: (films) => films.filter((film) => film.userDetails.watchlist),
  [FilterType.HISTORY]: (films) => films.filter((film) => film.userDetails.alreadyWatched),
  [FilterType.FAVORITE]: (films) => films.filter((film) => film.userDetails.favorite),
};

export { filter };
