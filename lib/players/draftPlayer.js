import {ref, update} from "firebase/database";
import {database} from "../firebaseConfig.js";
import {stripStr} from "../util/utils.js";
import {databaseRoutes} from "@/app-constants.js";

export const draftPlayer = async (player, username) => {
    console.log('Player:: ', player);
    try {
        const playerKey = stripStr(player.NAME);
        const key = `/${databaseRoutes.USERS}/${username.toLowerCase()}`;
        const updates = {
            [key]: {
                PLAYERS: {
                    [`${playerKey}`]: true,
                }
            }
        }

        await update(ref(database), updates);
    } catch
        (e) {
        return `There was an issue with trying to draft ${player.NAME} for ${username}`;
    }
}