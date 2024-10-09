import {databaseRoutes, DB_TYPES, PREVIOUS_YEAR} from "../../src/app-constants.js";
import {stripStr} from "../util/utils.js";

/**
 * A utility function that takes a key/value pair array converts it to an object.
 *
 * @param {[string, any][]} arr - the array to convert to an object. Must be key/value pair only.
 * @param {string} propName - the name of the field to make the make key of the node to be added to the database.
 * @return {*|{}} - the converted object.
 */
export const convertArrayToDictionary = (arr, propName = 'NAME') =>
    [...arr].reduce((accum, current) => {
        const modifiedName = stripStr(current[propName]);
        accum[`${modifiedName}`] = current;
        return accum;
    }, {});

/**
 * A helper function that takes an array, and propName to convert
 * the array into a dictionary in Json string form.
 *
 * @param {[string,any][]} jsonArr - an array of key/value pairs.
 * @param {string} propName - property name to make the main key of the object to be pushed to the database.
 * @return {string} - the stringified json dictionary.
 */
export const convertToFirebaseJsonFormat = (jsonArr, propName = 'NAME') => {
    const arr = convertArrayToDictionary(jsonArr, propName);

    return JSON.stringify(arr);
};

/**
 * A utility function that returns the appropriate database route.
 *
 * @param {DB_TYPES} dbType - one of the DB_TYPES enum types.
 * @param {string} key - additional database query key.
 * @param {number} seasonYear - optional, only needed if specifying a season, otherwise last year's stats will be used.
 * @return {string} - the appropriate database route.
 */
export const getDBPath = (dbType, key, seasonYear = PREVIOUS_YEAR) => {
    switch (dbType) {
        case DB_TYPES.STATS:
            return `${databaseRoutes.PLAYER_STATS}_${seasonYear}/${key}`;
        case DB_TYPES.USERS:
            return `${databaseRoutes.USERS}/${key}`;
        case DB_TYPES.MESSAGES:
            return `${databaseRoutes.MESSAGES}/${key}`;
        case DB_TYPES.LEAGUES:
            return `${databaseRoutes.LEAGUES}/${key}`;
        case DB_TYPES.RULES:
            return `${databaseRoutes.RULES}/${key}`;
        case DB_TYPES.DRAFT_POOL:
            return `${databaseRoutes.DRAFT_POOL}/${key}`;
    }
};

/**
 * A helper function that takes the database route and returns human-readable text.
 *
 * @param {DB_TYPES} dbType - one of the DB_TYPES enum types.
 * @return {string} - human-readable text.
 */
export const getDBTypeReadable = dbType => {
    switch (dbType) {
        case DB_TYPES.STATS:
            return `Players`;
        case DB_TYPES.USERS:
            return `Users`;
        case DB_TYPES.MESSAGES:
            return `Messages`;
        case DB_TYPES.LEAGUES:
            return `Leagues`;
        case DB_TYPES.RULES:
            return 'League Rules';
        case DB_TYPES.DRAFT_POOL:
            return `Draft Pool Players`;
    }
};