import {off, onValue, ref, remove, update} from "firebase/database";
import {database} from "../firebaseConfig.js";
import {stripStr} from "../util/utils.js";
import {databaseRoutes, POSITIONS} from "@/app-constants.js";
import {getLeagueDraft} from "../league/leagueDraft.js";

export const draftPlayer = async (leagueName, userName, teamName, player) => {
    try {
        const team = stripStr(teamName).toLowerCase();
        const playerKey = stripStr(player.NAME).toLowerCase();
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

export const getDraftedPlayers = async (leagueKey, teamKey, rosterMap, updateRoster) => {
    try {
        const rosterRef = ref(database, `/${databaseRoutes.LEAGUES}/${leagueKey}/TEAMS/${teamKey}/`);

        onValue(rosterRef, snapshot => {
            if (snapshot.exists()) {
                const snapShotData = snapshot.val();
                const roster = {...rosterMap};

                const draftedArr = Object.entries(snapShotData);
                draftedArr?.length > 0 && draftedArr.forEach(
                    ([_, playerObj]) => {
                        const position = playerObj.position;
                        const filteredByPos = Object.entries(roster)
                            .filter(([key, value]) => key && key.includes(position) && !value);

                        if (filteredByPos.length > 0) {
                            roster[filteredByPos[0][0]] = playerObj.name
                        } else {
                            const isOPType = playerObj.position === POSITIONS.QB || playerObj.position === POSITIONS.RB || playerObj.position === POSITIONS.WR || playerObj.position === POSITIONS.TE;

                            if (!roster['OP_0'] && isOPType) {
                                roster['OP_0'] = playerObj.name
                            } else {
                                const filteredByBench = Object.entries(roster)
                                    .filter(([key, value]) => key.includes('BENCH_') && !value);

                                roster[filteredByBench[0][0]] = playerObj.name
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