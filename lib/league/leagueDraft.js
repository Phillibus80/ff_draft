import {get, off, onValue, orderByKey, query, ref} from "firebase/database";
import {database} from "../firebaseConfig.js";
import {databaseRoutes} from "@/app-constants.js";

/**
 * A promise-base GETTER function that returns all the draft info for a given league.
 *
 * @param {string} leagueName - league name key.
 * @return {Promise<any>} - a promise that, when successful, will any updated info from the realtime database.
 */
export const getLeagueDraft = async leagueName => {
    try {
        const leagueDraftRef = await ref(database, `${databaseRoutes.LEAGUES}/${leagueName}/DRAFT`);

        const snapshot = await get(leagueDraftRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log('Nothing to return.')
        }
    } catch (e) {
        console.error(`Issue getting the league's draft info for:: ${leagueName}`, e);
    }
};

/**
 * A function that establishes a realtime database connection.  Whenever a player is drafted, the realtime
 * database will automatically update any clients.
 *
 * @param {string} leagueName - league name key.
 * @param {function} setDraftData - setState callback that will receive draft update from the onValue function call.
 * @return {function(): void} - a clean-up function that cuts the connection the realtime database.
 */
export const getLeagueDraftUpdates = (leagueName, setDraftData) => {
    try {
        const leagueDraftRef = ref(database, `${databaseRoutes.LEAGUES}/${leagueName}/DRAFT`);
        const draftQuery = query(leagueDraftRef, orderByKey());

        onValue(draftQuery, snapshot => {
            const result = (snapshot.exists()) ? ({data: snapshot.val()}) : ({data: null});
            setDraftData(result.data);
        });

        return () => off(leagueDraftRef, 'value');
    } catch (e) {
        console.error(`Issue getting the league's draft info for:: ${leagueName}`, e);
    }
};