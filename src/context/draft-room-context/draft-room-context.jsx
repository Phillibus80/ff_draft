"use client";

import {createContext, useState} from "react";
import {useSession} from "next-auth/react";
import {
    useGetCurrentDraftedRoster,
    useGetDraftQueue,
    useGetLeagueDraftDetails,
    useGetLeagueRules,
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

    // League Config
    const [leagueRules, setLeagueRules] = useState({
        draft: {},
        roster_construction: {},
        scoring: {}
    });
    useGetLeagueRules(leagueName, session, status, setLeagueRules);

    // League Draft Details
    const [currentDraftStatus, setCurrentDraftStatus] = useState();
    const [managerObjects, setManagerObjects] = useState([]);
    const [roster, setRoster] = useState({});
    const [draftQueue, setDraftQueue] = useState();

    useGetLeagueDraftDetails(session, status, setCurrentDraftStatus);
    useGetCurrentDraftedRoster(leagueName, session, status, setRoster);
    useGetManagers(currentDraftStatus, setManagerObjects);
    useGetDraftQueue(setDraftQueue, currentDraftStatus, leagueRules.draft, managerObjects)

    const timeAllowed = !!currentDraftStatus?.TIME_PER_SELECTION
        ? Number(currentDraftStatus.TIME_PER_SELECTION)
        : 0;

    // Timer State
    const [isRunning, setIsRunning] = useState(true);

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
                draftRules: leagueRules.draft,
                rosterConstruction: leagueRules.roster_construction,
                scoringRules: leagueRules.scoring,
                pauseTimer: () => setIsRunning(false),
                resumeTimer: () => setIsRunning(true),
                resetTimer: () => setIsRunning(false)
            }}>
                {children}
            </DraftContext.Provider>
        );
};

export default DraftRoomContext;