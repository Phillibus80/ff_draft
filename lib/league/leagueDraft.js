import {get, off, onValue, orderByKey, query, ref} from "firebase/database";
import {database} from "../firebaseConfig.js";
import {databaseRoutes} from "@/app-constants.js";

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