'use server';

import {database as db} from "../firebaseConfig.js";
import {get, onValue, ref} from "firebase/database";
import {databaseRoutes, PLAYER_KEYS, PositionEnum, PREVIOUS_YEAR} from "@/app-constants.js";
import {convertArrayToDictionary} from "@/data/data-utils.js";

export const getAllDraftPoolPlayers = async () => {
    const playersRef = ref(db, `/${databaseRoutes.DRAFT_POOL}/`);
    let players = [];

    try {
        onValue(playersRef, snapshot => {
            if (snapshot.exists()) {
                const snapShotData = snapshot.val();

                players = Object.values(snapShotData)
                    ?.sort((a, b) => b[PLAYER_KEYS.PTS] - a[PLAYER_KEYS.PTS]);

                return convertArrayToDictionary(players)
            }
        });
    } catch (e) {
        console.error('There was a problem getting the players from the database. ', e);
    }
};

export const getAllPlayers = async (position = '', seasonYear = PREVIOUS_YEAR) => {
    const isRealPos = PositionEnum.some(pos => pos === position);
    const playersRef = ref(db, `/players_stats_${seasonYear}/`);
    let players = [];

    try {
        const snapshot = await get(playersRef);
        if (snapshot.exists()) {
            const snapShotData = snapshot.val();
            players = Object.values(snapShotData)?.sort(
                    (a, b) => b[PLAYER_KEYS.PTS] - a[PLAYER_KEYS.PTS])
                || [];
        }
    } catch (e) {
        console.error('There was a problem getting the players from the database. ', e);
    }

    return isRealPos
        ? players.filter(({POS}) => POS === position)
        : players;
};


