import {useEffect} from "react";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {getLeagueFromSession, stripStr} from "../../../lib/util/utils.js";
import {getLeagueDraftUpdates} from "../../../lib/league/leagueDraft.js";
import {getAllRules} from "../../../lib/rules/rules.js";
import {getRosterSlots} from "../../../lib/util/roster-utils.js";
import {getDraftedPlayers} from "../../../lib/players/draftPlayer.js";

export const useGetLeagueDraftDetails = (session, status, setStateCallback) => {
    useEffect(() => {
        let unsubscribe;

        if (status === SESSION_CONSTANTS.AUTHENTICATED) {
            const leagueKey = getLeagueFromSession(session, status);

            unsubscribe = getLeagueDraftUpdates(leagueKey, setStateCallback);
        }

        return () => !!unsubscribe ?? unsubscribe();
    }, [status]);
};

export const useGetCurrentDraftedRoster = (leagueName, session, status, setStateCallback) => {
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
                        console.error('Issue getting the drafted roster.');
                        throw new Error('No roster returned.')
                    }
                })
        }

        // Clean up
        return () => !!unsubscribe ?? unsubscribe();
    }, [status]);
}

export const useGetLeagueRules = (leagueName, session, status, setStateCallback) => {
    useEffect(() => {
        const leagueKey = stripStr(leagueName);
        let unsubscribe;

        if (status === SESSION_CONSTANTS.AUTHENTICATED) {
            getAllRules(leagueKey)
                .then(res => {
                    try {
                        const {config} = res;
                        setStateCallback(prev => ({...prev, ...config}));
                    } catch (e) {
                        console.error('Issue getting the rules.');
                        throw new Error('No rules returned.')
                    }
                })
        }

        // Clean up
        return () => !!unsubscribe ?? unsubscribe();
    }, [status]);
}