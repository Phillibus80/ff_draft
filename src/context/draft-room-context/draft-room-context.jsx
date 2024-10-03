"use client";

import {createContext, useState} from "react";
import {useSession} from "next-auth/react";
import {
    useGetCurrentDraftedRoster,
    useGetLeagueDraftDetails,
    useGetLeagueRules
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

    // League Draft Details
    const [currentDraftStatus, setCurrentDraftStatus] = useState({});
    const [roster, setRoster] = useState({});
    const [managerObjects, setManagerObjects] = useState([]);

    useGetLeagueDraftDetails(session, status, setCurrentDraftStatus);
    useGetCurrentDraftedRoster(leagueName, session, status, setRoster);

    const timeAllowed = !!currentDraftStatus?.TIME_PER_SELECTION
        ? Number(currentDraftStatus.TIME_PER_SELECTION)
        : 0;

    console.log('Manager Objects:: ', managerObjects);

    // Timer State
    const [isRunning, setIsRunning] = useState(true);

    // League Rules
    const [leagueRules, setLeagueRules] = useState({
        draft: {},
        roster_construction: {},
        scoring: {}
    });
    useGetLeagueRules(leagueName, session, status, setLeagueRules);

    return status === SESSION_CONSTANTS.LOADING
        ? <div>Loading...</div>
        : (
            <DraftContext.Provider value={{
                leagueDraft: currentDraftStatus,
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