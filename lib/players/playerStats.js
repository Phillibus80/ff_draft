import {database as db} from "../firebaseConfig.js";
import {get, off, onValue, ref} from "firebase/database";
import {databaseRoutes, PLAYER_KEYS, PositionEnum, PREVIOUS_YEAR} from "@/app-constants.js";
import {convertArrayToDictionary} from "../data/data-utils.js";

/**
 * A helper function that will sort the player by their fantasy points from the previous year.
 *
 * @param {Object} snapShotData - snapshot data returned from the Firebase onValue function call.
 * @return {*|*[]} - array of sorted players.  Can return an empty array.
 */
function sortPlayersByFPTS(snapShotData) {
    return snapShotData
        ? Object.values(snapShotData)?.sort((a, b) => b[PLAYER_KEYS.PTS] - a[PLAYER_KEYS.PTS])
        : [];
}

/**
 * A GETTER function that retrieves all the draft-able players.
 *
 * @param {function} updateState - a setState function that is called when the promise is resolved.
 * @return {function(): void} - a clean-up function the cuts the connection to the database.
 */
export const getDraftPoolPlayers = updateState => {
    const playersRef = ref(db, `/${databaseRoutes.DRAFT_POOL}/`);

    try {
        onValue(playersRef, snapshot => {
            if (snapshot.exists()) {
                const snapShotData = snapshot.val();
                const players = sortPlayersByFPTS(snapShotData);
                const result = convertArrayToDictionary(players);

                updateState(result);
            }
        });

        return () => off(playersRef, 'value');
    } catch (e) {
        console.error('There was a problem getting the players from the database. ', e);
    }
};

/**
 * A GETTER function that retrieves all players from the database.
 *
 * @param {PositionEnum|string} position - a string of the position.  Will be checked if it is one of the PositionEnum types.
 * @param {number} seasonYear - the year to use when getting the draft-able players.
 * @return {Promise<*[]>} - a promise that, when successful, will resolve with sorted players data array.
 */
export const getAllPlayers = async (position = '', seasonYear = PREVIOUS_YEAR) => {
    const isRealPos = PositionEnum.some(pos => pos === position);
    const playersRef = ref(db, `/${databaseRoutes.PLAYER_STATS}_${seasonYear}/`);
    let players = [];

    try {
        const snapshot = await get(playersRef);
        if (snapshot.exists()) {
            const snapShotData = snapshot.val();
            const snapShotValues = Object.values(snapShotData);

            players = sortPlayersByFPTS(snapShotValues);
        }
    } catch (e) {
        console.error('There was a problem getting the players from the database. ', e);
    }

    return isRealPos
        ? players.filter(({POS}) => POS === position)
        : players;
};


