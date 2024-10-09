/**
 * @typedef {import('../../../lib/jsdoc/types.js').draftPlayerConfig} draftPlayerConfig
 * @typedef {import('../../../lib/jsdoc/types.js').playerPositionConfig} playerPositionConfig
 * @typedef {import('../../../lib/jsdoc/types.js').draftPlayerInfo} draftPlayerInfo
 */

import {off, onValue, ref, remove, update} from "firebase/database";
import {database} from "../firebaseConfig.js";
import {stripStr} from "../util/utils.js";
import {databaseRoutes, POSITIONS} from "@/app-constants.js";
import {getLeagueDraft} from "../league/leagueDraft.js";

/**
 * A function that updates the necessary nodes when a player is drafted.
 *
 * @param {string} leagueName - the name of the league
 * @param {string} userName - the username of the one drafting a player
 * @param {string} teamName - the name of the user's team
 * @param {draftPlayerInfo} player - the player object that is being drafted
 */
export const draftPlayer = async (leagueName, userName, teamName, player) => {
    try {
        const team = stripStr(teamName);
        const playerKey = stripStr(player.NAME);
        const timeStamp = Date.now();
        const draftInfo = await getLeagueDraft(leagueName);

        await update(ref(database, `/${databaseRoutes.LEAGUES}/${leagueName}/TEAMS/${team}/${playerKey}`), {
            name: player.NAME, position: player.POS, drafted: `by ${teamName}`
        });
        await update(ref(database, `/${databaseRoutes.LEAGUES}/${leagueName}/DRAFT/`), {
            TIMESTAMP_OF_LAST_SELECTION: timeStamp,
            CURRENT_DRAFT_POSITION: draftInfo.CURRENT_DRAFT_POSITION + 1
        });
        await update(ref(database, `/${databaseRoutes.LEAGUES}/${leagueName}/DRAFT/DRAFT_SELECTIONS`), {
            [`${draftInfo.CURRENT_DRAFT_POSITION}`]: player.NAME
        });
        await remove(ref(database, `/${databaseRoutes.DRAFT_POOL}/${playerKey}`));
    } catch (e) {
        const errorMessage = `There was an issue with trying to draft ${player.NAME} for ${userName}`;
        console.error(`${errorMessage}`, e);

        return errorMessage;
    }
}

/**
 * A helper function that takes the current roster, and filters
 * it by the position provided.
 *
 * @param {draftedRoster} roster - the current drafted roster, empty roster slots are included.
 * @param {string} position - the position to filter by. One of the POSITION enum types.
 * @return {draftPlayerInfo} - a key, value pair 2D array, which contains the all empty roster slots filtered by position.
 */
const getEmptyRosterSlotsByPosition = (roster, position) => {
    return Object.entries(roster)
        .filter(([key, value]) => key && key.includes(position) && !value);
}

/**
 * A helper function that acts like a flag on the player's position. If the position
 * matches one of POSITIONS enum types: QB, RB, WR, TE
 *
 * @param {draftPlayerConfig} playerObj - the player being drafted.
 * @return {boolean} true if the player is OP type
 */
const isOffensivePlayer = (playerObj) => {
    return playerObj.position === POSITIONS.QB || playerObj.position === POSITIONS.RB || playerObj.position === POSITIONS.WR || playerObj.position === POSITIONS.TE;
}

/**
 * A helper function to populate the roster object based on
 * the first available of the positions array.
 *
 * @param {draftedRoster} roster - the current drafted roster, empty roster slots are included.
 * @param {draftPlayerInfo} positions - a 2D array of the position key and player name value arrays
 * @param {string} playerName - the drafted player's name
 * @param {string} optionalKey - if the optionalKey is filled out, then that will act as the roster's key/position
 */
const populateRoster = (roster, positions, playerName, optionalKey = '') => {
    const firstAvailablePositionKey = optionalKey ? optionalKey : positions[0][0];
    roster[firstAvailablePositionKey] = playerName;
}

/**
 * A function that calls the Firebase RealTime Database for the user's drafted
 * players.  This will update in real time.
 *
 * @param {string} leagueKey - the name of the league that has be returned from the stripStr function
 * @param {string} teamKey - the name of the team drafting that has be returned from the stripStr function
 * @param {Object} rosterMap - an object of the current roster (drafted players and empty slots)
 * @param {function} updateRoster - callback function when the roster has been updated
 * @return {Promise<function(): void>} - a callback function that unregisters the database connection
 */
export const getDraftedPlayers = async (leagueKey, teamKey, rosterMap, updateRoster) => {
    try {
        const rosterRef = ref(database, `/${databaseRoutes.LEAGUES}/${leagueKey}/TEAMS/${teamKey}/`);

        onValue(rosterRef, snapshot => {
            if (snapshot.exists()) {
                const snapShotData = snapshot.val();
                const draftedPlayers = Object.entries(snapShotData);
                const hasDraftedPlayers = draftedPlayers?.length > 0;
                const roster = {...rosterMap};

                hasDraftedPlayers && draftedPlayers.forEach(
                    ([_, playerObj]) => {
                        const emptyPositions = getEmptyRosterSlotsByPosition(roster, playerObj.position);
                        const isEmptyPositionAvailable = emptyPositions.length > 0;

                        switch (isEmptyPositionAvailable) {
                            case true:
                                populateRoster(roster, emptyPositions, playerObj.name);

                                break;

                            case false:
                                const isOPType = isOffensivePlayer(playerObj);
                                const offensivePlayerPositionKey = 'OP_0';
                                const flexPlayerPositionKey = 'FLEX_0';
                                const isOPAvailable = !roster[offensivePlayerPositionKey] && isOPType;
                                const isFlexAvailable = !roster[flexPlayerPositionKey] && isOPType;

                                if (isFlexAvailable) {
                                    populateRoster(roster, [], playerObj.name, flexPlayerPositionKey);
                                } else if (!isFlexAvailable && isOPAvailable) {
                                    populateRoster(roster, [], playerObj.name, offensivePlayerPositionKey);
                                } else {
                                    const benchPositions = getEmptyRosterSlotsByPosition(roster, 'BENCH_');
                                    populateRoster(roster, benchPositions, playerObj.name);
                                }

                                break;
                        }
                    });

                updateRoster(roster);
            } else {
                updateRoster(rosterMap);
            }
        });

        return () => off(rosterRef, 'value');
    } catch (e) {
        console.error('There was an issue populating the drafted roster.', e);
    }
};