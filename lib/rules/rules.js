'use server';

import {database as db} from "../firebaseConfig.js";
import {get, ref} from "firebase/database";

export const getAllRules = async () => {
    const rulesRef = ref(db, 'rules/');
    const rules = [];

    try {
        const snapshot = await get(rulesRef);

        if (snapshot.exists()) {
            return snapshot.val();
        }
    } catch (e) {
        console.error('Issue with getting the rules from the database.');
    }
}