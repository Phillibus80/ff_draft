import {onValue, ref, remove, update} from "firebase/database";
import {database} from "../firebaseConfig.js";
import {stripStr} from "../util/utils.js";
import {databaseRoutes} from "@/app-constants.js";

export const draftPlayer = async (leagueName, userName, teamName, player) => {
    try {
        const team = stripStr(teamName).toLowerCase();
        const playerKey = stripStr(player.NAME).toLowerCase();
        const updates = {
            position: player.POS,
            drafted: true
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
                const drafted = Object.entries(snapShotData);
                console.log('Drafted:: ', drafted);
                console.log('Roster Map:: ', rosterMap);

                updateRoster(snapShotData);
            }
        });
    } catch (e) {
        console.error('There was an issue populating the drafted roster.', e);
    }

};