import {onValue, ref, remove, update} from "firebase/database";
import {database} from "../firebaseConfig.js";
import {stripStr} from "../util/utils.js";
import {databaseRoutes, POSITIONS} from "@/app-constants.js";

export const draftPlayer = async (leagueName, userName, teamName, player) => {
    try {
        const team = stripStr(teamName).toLowerCase();
        const playerKey = stripStr(player.NAME).toLowerCase();
        const updates = {
            name: player.NAME, position: player.POS, drafted: `by ${teamName}`
        }

        await update(ref(database, `/${databaseRoutes.LEAGUES}/${leagueName}/TEAMS/${team}/${playerKey}`), updates);
        await remove(ref(database, `/${databaseRoutes.DRAFT_POOL}/${playerKey}`));
    } catch (e) {
        const errorMessage = `There was an issue with trying to draft ${player.NAME} for ${userName}`;
        console.error(`${errorMessage}`, e);

        return errorMessage;
    }
}

export const getDraftedPlayers = async (leagueKey, teamKey, rosterMap, updateRoster) => {
    try {
        const rosterRef = ref(database, `/${databaseRoutes.LEAGUES}/${leagueKey}/TEAMS/${teamKey}/`);

        onValue(rosterRef, snapshot => {
            if (snapshot.exists()) {
                const snapShotData = snapshot.val();
                const roster = {...rosterMap};

                const draftedArr = Object.entries(snapShotData);
                draftedArr.forEach(([_, playerObj]) => {
                    const position = playerObj.position;
                    const filteredByPos = Object.entries(roster)
                        .filter(([key, value]) => key.includes(position) && !value);

                    const filteredByBench = Object.entries(roster)
                        .filter(([key, value]) => key.includes('BENCH_') && !value);

                    if (filteredByPos.length > 0) {
                        roster[filteredByPos[0][0]] = playerObj.name
                    } else {
                        const isOPType = playerObj.position === POSITIONS.QB || playerObj.position === POSITIONS.RB || playerObj.position === POSITIONS.WR || playerObj.position === POSITIONS.TE;

                        if (!roster['OP_0'] && isOPType) {
                            roster['OP_0'] = playerObj.name
                        } else {
                            roster[filteredByBench[0][0]] = playerObj.name
                        }
                    }

                });


                console.log('Drafted:: ', draftedArr);
                console.log('Roster Map:: ', roster);

                updateRoster(roster);
            } else {
                updateRoster(rosterMap);
            }
        });
    } catch (e) {
        console.error('There was an issue populating the drafted roster.', e);
    }

};