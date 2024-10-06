import {SESSION_CONSTANTS} from '../../src/app-constants.js';

/**
 * A utility function that delays the call to a function. Useful for form submission.
 *
 * @param {function} func - function call to delay.
 * @param {number} wait - time in ms to delay.
 * @return {(function(...[*]): void)|*} - the wrapped delayed function call.
 */
export function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * A utility function that takes a string and strips out any non-allowed character,
 * then converts it to a lowercase, snake-case key.
 *
 * @param {string} str - string to modify.
 * @return {string} - lowercase, snake-case key.
 */
export const stripStr = str => str && str
    .toLowerCase()
    .trim()
    .replaceAll(' ', '_')
    .replaceAll(/[\.\,\'\#\$\[\]]/g, '');

export const getLeagueFromSession = (session, status) => {
    // TODO make this dynamic
    const currentLeague = 'da_league';

    if (status === SESSION_CONSTANTS.AUTHENTICATED) {
        return !!session?.user?.leagues[currentLeague]
            ? currentLeague
            : '';
    }
}

/**
 * A utility function to convert ms to min:sec
 *
 * @param {number} ms - ms to convert to min:sec
 * @return {string} - a string in the format of ${number}:${string|number}
 */
export const msToMinSec = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Add leading zeros to seconds if needed
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${formattedSeconds}`;
}