import {PREVIOUS_YEAR} from "../app-constants.js";

export const convertToFirebaseJsonFormat = (jsonArr, propName = 'NAME') => {
    const arr = [...jsonArr].reduce((accum, current) => {
        const modifiedName = current[propName]
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll(/[\.\,\#\$\[\]]/g, '');
        accum[`${modifiedName}`] = current;
        return accum;
    }, {});

    return JSON.stringify(arr);
};

export const getDBPath = (dbType, key, seasonYear = PREVIOUS_YEAR) => {
    switch (dbType) {
        case 'stats':
            return `players_stats_${seasonYear}/${key}`;
        case 'users':
            return `users/${key}`;
        case 'messages':
            return `messages/${key}`;
        case 'leagues':
            return `leagues/${key}`;
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
    }
};