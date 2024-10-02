import {off, onValue, ref, remove, update} from "firebase/database";
import {database} from "../firebaseConfig.js";
import {stripStr} from "../util/utils.js";
import {databaseRoutes, POSITIONS} from "@/app-constants.js";
import {getLeagueDraft} from "../league/leagueDraft.js";

/**
 * A function that updates the necessary nodes when a player is drafted.
 * @param {string} leagueName - the name of the league
 * @param {string} userName - the username of the one drafting a player
 * @param {string} teamName - the name of the user's team
 * @param {Object.<string, any>} player - the player object that is being drafted
 * @return {Promise<string>} - promises to update the database with the drafted player
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
 * A function that takes the current roster, and filters
 * it by the position provided.
 * @param {Object.<string, any>} roster - the current drafted roster, empty roster slots are included.
 * @param {string} position - the position to filter by. One of the POSITION enum types.
 * @return {[[string: 'Postion', string: 'Player Name']]} - a key, value pair 2D array, which contains the all empty roster slots filtered by position.
 */
const getEmptyRosterSlotsByPosition = (roster, position) => {
    return Object.entries(roster)
        .filter(([key, value]) => key && key.includes(position) && !value);
}

/**
 * A function that acts like a flag on the player's position. If the position
 * matches one of POSITIONS enum types: QB, RB, WR, TE
 * @param {Object.<string, any>} playerObj - the player being drafted.
 * @return {boolean} true if the player is OP type
 */
const isOffensivePlayer = (playerObj) => {
    return playerObj.position === POSITIONS.QB || playerObj.position === POSITIONS.RB || playerObj.position === POSITIONS.WR || playerObj.position === POSITIONS.TE;
}

/**
 * A helper function to populate the roster object based on
 * the first available of the positions array.
 * @param {Object.<string, any>} roster - the current drafted roster, empty roster slots are included.
 * @param {[string: "Postion", string: "Player Name"][]} positions - a 2D array of the position key and player name value arrays
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

                        if (isEmptyPositionAvailable) {
                            populateRoster(roster, emptyPositions, playerObj.name);
                        } else {
                            const isOPType = isOffensivePlayer(playerObj);
                            const isOPAvailable = !roster['OP_0'] && isOPType;
                            const isFlexAvailable = !roster['FLEX_0'] && isOPType;

                            if (isFlexAvailable) {
                                populateRoster(roster, [], playerObj.name, 'FLEX_0');
                            } else if (!isFlexAvailable && isOPAvailable) {
                                populateRoster(roster, [], playerObj.name, 'OP_0');
                            } else {
                                const benchPositions = getEmptyRosterSlotsByPosition(roster, 'BENCH_');
                                populateRoster(roster, benchPositions, playerObj.name);
                            }
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