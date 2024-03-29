import dayjs from 'dayjs';
import { FilterType, UserRatings } from '../const.js';
import { filter } from './filter.js';

const getWeightForNullDate = (dateA, dateB) => {
  if (dateA === null && dateB === null) {
    return 0;
  }

  if (dateA === null) {
    return 1;
  }

  if (dateB === null) {
    return -1;
  }

  return null;
};

function getTimeFromMins(mins) {
  const hours = Math.trunc(mins / 60);
  const minutes = mins % 60;
  return `${hours }h ${ minutes }m`;
}

const sortByDate = (filmA, filmB) => {
  const weight = getWeightForNullDate(filmA.filmInfo.release.date, filmB.filmInfo.release.date);

  return weight ?? dayjs(filmB.filmInfo.release.date).diff(dayjs(filmA.filmInfo.release.date));
};

const sortByRating = (filmA, filmB) => {
  if (filmA.filmInfo.totalRating < filmB.filmInfo.totalRating) {
    return 1;
  }
  if (filmA.filmInfo.totalRating > filmB.filmInfo.totalRating) {
    return -1;
  }
  return 0;
};

const humanizeYear = (date) => dayjs(date).format('YYYY');
const humanizeReleaseDate = (date) => dayjs(date).format('DD MMMM YYYY');

const isEscapeEvent = (evt) => evt.key === 'Escape' || evt.key === 'Esc';

const isCtrlEnterEvent = (evt) => evt.key === 'Enter' && (evt.ctrlKey || evt.metaKey);

const getUserRating = (films) => {

  const watchedFilmsCount = filter[FilterType.HISTORY](films).length;

  if (watchedFilmsCount <= UserRatings.NOVICE.max) {
    return UserRatings.NOVICE.rating;
  }

  if (watchedFilmsCount <= UserRatings.FAN.max) {
    return UserRatings.FAN.rating;
  }

  return UserRatings.MOVIE_BUFF.rating;
};

export {
  sortByDate,
  sortByRating,
  humanizeYear,
  getUserRating,
  isEscapeEvent,
  getTimeFromMins,
  isCtrlEnterEvent,
  humanizeReleaseDate,
};
