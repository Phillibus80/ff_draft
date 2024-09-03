'use server';

import {database as db} from "../firebaseConfig.js";
import {get, ref} from "firebase/database";
import {databaseRoutes} from "@/app-constants.js";

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