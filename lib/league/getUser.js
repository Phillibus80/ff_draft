'use server';

import {database as db} from "../firebaseConfig.js";
import {get, ref} from "firebase/database";
import {databaseRoutes} from "@/app-constants.js";

/**
 * A GETTER function that retrieve the user from the database by means of
 * searching by the given username.
 *
 * @param {string} username - the username key.
 * @return {Promise<any|null>} - a promise, when successful, will resolve when the user is found and returned.
 */
export async function getUser(username) {
    try {
        const userRef = ref(db, `${databaseRoutes.USERS}/${username}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log('#getUser -> User not found');
            return null;
        }
    } catch (e) {
        console.error('Issue with getting the user from the database.', e);
    }
}