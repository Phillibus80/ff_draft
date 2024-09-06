import {databaseRoutes, PREVIOUS_YEAR} from "../app-constants.js";
import {stripStr} from "../../lib/util/utils.js";

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
        case 'stats':
            return `players_stats_${seasonYear}/${key}`;
        case 'users':
            return `${databaseRoutes.USERS}/${key}`;
        case 'messages':
            return `${databaseRoutes.MESSAGES}/${key}`;
        case 'leagues':
            return `${databaseRoutes.LEAGUES}/${key}`;
        case 'rules':
            return `${databaseRoutes.RULES}/${key}`;
        case 'draft-pool':
            return `${databaseRoutes.DRAFT_POOL}/${key}`;
    }
};

export const getDBTypeReadable = dbType => {
    switch (dbType) {
        case 'stats':
            return `Players`;
        case 'users':
            return `Users`;
        case 'messages':
            return `Messages`;
        case 'leagues':
            return `Leagues`;
        case 'rules':
            return 'League Rules';
        case 'draft-pool':
            return `Draft Pool Players`;
    }
};