'use server';

import {database as db} from "../firebaseConfig.js";
import {ref, get} from "firebase/database";
import {PositionEnum, PREVIOUS_YEAR} from "../../app-constants.js";

export const getAllPlayers = async (position = '', seasonYear = PREVIOUS_YEAR) => {
    const isRealPos = PositionEnum.some(pos => pos === position);
    const playersRef = ref(db, `players_stats_${seasonYear}/`);
    let players;

    try {
        const snapshot = await get(playersRef);
        if (snapshot.exists()) {
            players = snapshot.val();
        }
    } catch (e) {
        console.error('There was a problem getting the players from the database. ', e);
    }

    return isRealPos
        ? Object.values(players).filter(({POS}) => POS === position)
        : Object.values(players);
};

export const getPlayer = slug => {
    return {};
};


