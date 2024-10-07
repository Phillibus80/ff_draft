/**
 * @typedef {import('../../../lib/jsdoc/types.js').Session} Session
 * @typedef {import('../../../lib/jsdoc/types.js').LeagueDraftRules} LeagueDraftRules
 * @typedef {import('../../../lib/jsdoc/types.js').SessionAuthStatus} SessionAuthStatus
 */

import {useEffect} from "react";
import {positionVisualOrder, SESSION_CONSTANTS} from "@/app-constants.js";
import {getLeagueFromSession, stripStr} from "../../../lib/util/utils.js";
import {getLeagueDraftUpdates} from "../../../lib/league/leagueDraft.js";
import {getAllRules} from "../../../lib/rules/rules.js";
import {getRosterSlots} from "../../../lib/util/roster-utils.js";
import {getDraftedPlayers} from "../../../lib/players/draftPlayer.js";
import {getUser} from "../../../lib/league/getUser.js";
import {generateDraftQueue} from "../../../lib/util/draft-queue-utils.js";

/**
 * A hook used to connect to the realtime database and retrieve the league's
 * draft updates. This includes base information about the league itself: commissioner's name,
 * league name, members (as in usernames), and the players selected in the draft.
 *
 * @param {Session} session - the user's session object returned from the server
 * @param {SessionAuthStatus} status - the authentication status of the session cookie
 * @param {function} setStateCallback - the setState callback function the receives the manager's data objects
 */
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

/**
 * A GETTER hook that connects to the realtime database which will allow for realtime updates whenever another, or the
 * user themselves draft, or trade a player.
 *
 * @param {string} leagueName - the league name key
 * @param {Session} session - the user's session object returned from the server
 * @param {SessionAuthStatus} status - the authentication status of the session cookie
 * @param {function} setStateCallback - the setState callback function the receives the manager's data objects
 */
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

                        // TODO refactor this
                        const rosterMap = getRosterSlots(roster_construction);
                        const rosterEntries = Object.entries(rosterMap);
                        const sorted = positionVisualOrder
                            // filter the roster with the position types and return an array filled with
                            // roster key(position)/value(player) objects
                            .map(positionKey => {
                                return rosterEntries
                                    .filter(([key, _]) => key.includes(positionKey))
                                    .reduce((accum, [key, value]) => {
                                        accum[key] = value;
                                        return accum;
                                    }, {});
                            })
                            //Flatten the array and convert to object
                            .reduce((accum, current) => {
                                const currentEntries = Object.entries(current);
                                currentEntries.forEach(([key, value]) => {
                                    accum[key] = value;
                                });

                                return accum;
                            }, {});

                        // Populate the roster with drafted players
                        const teamKey = stripStr(session?.user?.team);
                        unsubscribe = getDraftedPlayers(leagueKey, teamKey, sorted, setStateCallback);
                        setStateCallback(prevState => ({...sorted, ...prevState}));
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

/**
 * A GETTER hook that retrieves the league rules from the database.
 *
 * @param {string} leagueName - the league name key
 * @param {Session} session - the user's session object returned from the server
 * @param {SessionAuthStatus} status - the authentication status of the session cookie
 * @param {function} setStateCallback - the setState callback function the receives the manager's data objects
 */
export const useGetLeagueConfig = (leagueName, session, status, setStateCallback) => {
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

/**
 * A GETTER hook to takes the draft order from the league's draft rules,
 * and returns the manager's data objects through a setState callback.
 *
 * @param {LeagueDraftRules} draftRules - the league's draft rules returned from the database.
 * @param {function} setStateCallback - the setState callback
 */
export const useGetManagers = (draftRules, setStateCallback) => {
    useEffect(() => {
        if (!!draftRules?.DRAFT_ORDER) {
            const {DRAFT_ORDER: draftOrder} = draftRules;
            const getManagerObjects = async () => {
                const promises = draftOrder.map(managerUsername => getUser(managerUsername));

                return await Promise.all(promises);
            }
            getManagerObjects()
                .then(res => setStateCallback(res));
        }

    }, [draftRules?.DRAFT_ORDER]);
}

/**
 * A hook that generates the entire draft queue based on the league's draft rules and the original draft order.
 *
 * @param {Array<GetUserResponse>} prevDraftQue - previous state of the draft queue
 * @param {function} setStateCallback - the setState callback that sets the draft queue
 * @param {LeagueDraftRules} leagueDraft - the league rules and state of the league during the draft
 * @param {draftConfig} draftRules - the rule configuration for the league's draft
 * @param {Array<GetUserResponse>} managers - an array of the league's manager objects
 */
export const useGetDraftQueue = (prevDraftQue, setStateCallback, leagueDraft, draftRules, managers) => {
    const shouldPopulateQue = !prevDraftQue
        || prevDraftQue?.length === 0
        || (prevDraftQue?.length > 0 && !prevDraftQue[0]);
    const hasDataLoaded = !!draftRules?.draftStyle && !!leagueDraft?.DRAFT_ORDER;

    useEffect(() => {
        if (shouldPopulateQue && hasDataLoaded) {
            const {DRAFT_ORDER: draftOrder} = leagueDraft;
            const {draftStyle, numberOfRounds} = draftRules;

            const draftQueue = generateDraftQueue(draftStyle, numberOfRounds, draftOrder, managers);

            setStateCallback(draftQueue);
        }

    }, [managers, leagueDraft, draftRules]);
}