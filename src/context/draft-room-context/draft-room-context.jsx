"use client";

import {createContext, useState} from "react";
import {useSession} from "next-auth/react";
import {
    useGetCurrentDraftedRoster,
    useGetDraftQueue,
    useGetLeagueConfig,
    useGetLeagueDraftDetails,
    useGetManagers
} from "@/hooks/draft-tracker/draft-tracker-hooks.jsx";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {useFirebaseSignInWithCustomToken, useRerouteIfUnauthenticated} from "@/hooks/hooks.jsx";
import {setLeagueDraftIsRunning} from "../../../lib/league/leagueDraft.js";

export const DraftContext = createContext(null);

const DraftRoomContext = ({children}) => {
    const leagueName = 'da_league';

    // Session Tasks
    const {data: session, status} = useSession();
    useRerouteIfUnauthenticated(status);
    useFirebaseSignInWithCustomToken(session?.user?.customToken);

    // League Config and Draft Details
    const [leagueConfig, setLeagueConfig] = useState({
        draft: {},
        roster_construction: {},
        scoring: {}
    });
    const [currentDraftStatus, setCurrentDraftStatus] = useState();
    const [managerObjects, setManagerObjects] = useState([]);
    const [roster, setRoster] = useState({});
    const [draftQueue, setDraftQueue] = useState([]);

    // Hooks for handling the context state
    useGetLeagueConfig(leagueName, session, status, setLeagueConfig);
    useGetLeagueDraftDetails(session, status, setCurrentDraftStatus);
    useGetCurrentDraftedRoster(leagueName, session, status, setRoster);
    useGetManagers(currentDraftStatus, setManagerObjects);
    useGetDraftQueue(draftQueue, setDraftQueue, currentDraftStatus, leagueConfig.draft, managerObjects)

    // Timer
    const timeAllowed = !!currentDraftStatus?.TIME_PER_SELECTION
        ? Number(currentDraftStatus.TIME_PER_SELECTION)
        : 0;

    const pauseTimer = () => setLeagueDraftIsRunning(leagueName, false);

    const resumeTimer = () => setLeagueDraftIsRunning(leagueName, true);

    const resetTimer = () => setLeagueDraftIsRunning(leagueName, false);

    return status === SESSION_CONSTANTS.LOADING
        ? <div>Loading...</div>
        : (
            <DraftContext.Provider value={{
                user: session?.user?.uid,
                leagueDraft: currentDraftStatus,
                draftQueue,
                roster,
                leagueName,
                isRunning: currentDraftStatus?.IS_RUNNING,
                timeAllowed,
                draftRules: leagueConfig.draft,
                rosterConstruction: leagueConfig.roster_construction,
                scoringRules: leagueConfig.scoring,
                pauseTimer: pauseTimer,
                resumeTimer: resumeTimer,
                resetTimer: resetTimer,
                setDraftQueue: setDraftQueue
            }}>
                {children}
            </DraftContext.Provider>
        );
};

export default DraftRoomContext;