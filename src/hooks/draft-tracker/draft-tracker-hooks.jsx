import {useEffect, useState} from "react";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {getLeagueFromSession} from "../../../lib/util/utils.js";
import {getLeagueDraftUpdates} from "../../../lib/league/leagueDraft.js";

export const useGetLeagueDraftDetails = (session, status) => {
    const [currentDraftStatus, setCurrentDraftStatus] = useState(null);

    useEffect(() => {
        let unsubscribe;

        if (status === SESSION_CONSTANTS.AUTHENTICATED) {
            const leagueKey = getLeagueFromSession(session, status);

            unsubscribe = getLeagueDraftUpdates(leagueKey, setCurrentDraftStatus);
        }

        return () => unsubscribe && unsubscribe();
    }, [status]);

    return currentDraftStatus || {};
}