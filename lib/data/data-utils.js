import {databaseRoutes, DB_TYPES, PREVIOUS_YEAR} from "../../src/app-constants.js";
import {stripStr} from "../util/utils.js";

export const convertArrayToDictionary = (arr, propName = 'NAME') =>
    [...arr].reduce((accum, current) => {
        const modifiedName = stripStr(current[propName]);
        accum[`${modifiedName}`] = current;
        return accum;
    }, {});

export const convertToFirebaseJsonFormat = (jsonArr, propName) => {
    const arr = convertArrayToDictionary(jsonArr, propName);

    return JSON.stringify(arr);
};

export const getDBPath = (dbType, key, seasonYear = PREVIOUS_YEAR) => {
    switch (dbType) {
        case DB_TYPES.STATS:
            return `players_stats_${seasonYear}/${key}`;
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