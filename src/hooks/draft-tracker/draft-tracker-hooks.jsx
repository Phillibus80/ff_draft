import {useEffect, useState} from "react";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {getLeagueFromSession, stripStr} from "../../../lib/util/utils.js";
import {getLeagueDraftUpdates} from "../../../lib/league/leagueDraft.js";
import {getAllRules} from "../../../lib/rules/rules.js";
import {getRosterSlots} from "../../../lib/util/roster-utils.js";
import {getDraftedPlayers} from "../../../lib/players/draftPlayer.js";

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
};

export const useGetAllLeagueRules = (leagueName, session, status, setStateCallback) => {
    useEffect(() => {
        const leagueKey = stripStr(leagueName);
        let unsubscribe;

        if (status === SESSION_CONSTANTS.AUTHENTICATED) {
            // Build the roster template based on the
            // rules set
            getAllRules(leagueKey)
                .then(res => {
                    try {
                        const {config: {roster_construction}} = res;

                        const rosterMap = getRosterSlots(roster_construction);

                        // Populate the roster with drafted players
                        const teamKey = stripStr(session?.user?.team);
                        unsubscribe = getDraftedPlayers(leagueKey, teamKey, rosterMap, setStateCallback);
                        setStateCallback(prevState => ({...rosterMap, ...prevState}));
                    } catch (e) {
                        console.error('Issue getting the league rules.');
                        throw new Error('No rules returned.')
                    }
                })
        }

        // Clean up
        return () => unsubscribe ? unsubscribe() : null;
    }, [status]);
}