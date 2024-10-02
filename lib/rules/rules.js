'use server';

import {database as db} from "../firebaseConfig.js";
import {get, ref} from "firebase/database";
import {databaseRoutes} from "@/app-constants.js";

/**
 * A GETTER function that retrieves all of a league's rules.
 *
 * @param {string} leagueName - the league name key.
 * @return {Promise<any>} - a promise that, when successful, will resolve with the league's rules data as an object.
 */
export const getAllRules = async leagueName => {
    const rulesRef = ref(db, `${databaseRoutes.RULES}/${leagueName}`);

    try {
        const snapshot = await get(rulesRef);

        if (snapshot.exists()) {
            return snapshot.val();
        }

    } catch (e) {
        console.error('Issue with getting the rules from the database.');
    }
}