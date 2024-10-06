import {useEffect} from "react";
import {getDraftPoolPlayers} from "../../lib/players/playerStats.js";
import {SESSION_CONSTANTS} from "@/app-constants.js";

/**
 * A hook at returns all the draft pool player and sets the collection to the
 * setState callback function.
 *
 * @param {function} setStateCallback - the set state function the receives the collection of draft pool players.
 * @param {SessionAuthStatus} status - the current statue of the session cookie.
 */
export const useGetDraftPoolPlayers = (setStateCallback, status) => {
    useEffect(() => {
        if (status === SESSION_CONSTANTS.AUTHENTICATED) {
            const unsubscribe = getDraftPoolPlayers(setStateCallback)

            return () => unsubscribe ?? unsubscribe();
        }
    }, [status]);
}