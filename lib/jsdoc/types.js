/**
 * @typedef {Object} LeagueDraftRules
 * @property {string} COMMISSIONER
 * @property {number} CURRENT_DRAFT_POSITION
 * @property {string[]} DRAFT_ORDER
 * @property {string} START
 * @property {string} TIMESTAMP_OF_LAST_SELECTION
 * @property {string} TIME_PER_SELECTION
 */

/**
 * @typedef {Object} UserSessionObject
 * @property {string} customToken
 * @property {string} email
 * @property {array} leagues
 * @property {string} name
 * @property {string} team
 * @property {string} uid
 * @property {string} username
 */

/**
 * @typedef {Session} Session
 * @property {UserSessionObject|*} user - the user's session cookie returned from the server
 * @property {Date|*} expires - the authentication expiration date of the session cookie
 */

module.exports = {};