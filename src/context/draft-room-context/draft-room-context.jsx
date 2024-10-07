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
    // Timer State
    const [isRunning, setIsRunning] = useState(true);

    // Hooks for handling the state variables
    useGetLeagueConfig(leagueName, session, status, setLeagueConfig);
    useGetLeagueDraftDetails(session, status, setCurrentDraftStatus);
    useGetCurrentDraftedRoster(leagueName, session, status, setRoster);
    useGetManagers(currentDraftStatus, setManagerObjects);
    useGetDraftQueue(draftQueue, setDraftQueue, currentDraftStatus, leagueConfig.draft, managerObjects)

    const timeAllowed = !!currentDraftStatus?.TIME_PER_SELECTION
        ? Number(currentDraftStatus.TIME_PER_SELECTION)
        : 0;

    return status === SESSION_CONSTANTS.LOADING
        ? <div>Loading...</div>
        : (
            <DraftContext.Provider value={{
                leagueDraft: currentDraftStatus,
                draftQueue,
                roster,
                leagueName,
                isRunning,
                setIsRunning,
                timeAllowed,
                draftRules: leagueConfig.draft,
                rosterConstruction: leagueConfig.roster_construction,
                scoringRules: leagueConfig.scoring,
                pauseTimer: () => setIsRunning(false),
                resumeTimer: () => setIsRunning(true),
                resetTimer: () => setIsRunning(false),
                setDraftQueue: setDraftQueue
            }}>
                {children}
            </DraftContext.Provider>
        );
};

export default DraftRoomContext;