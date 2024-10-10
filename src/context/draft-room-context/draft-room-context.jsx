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
import {useCountDown, useUpdateTimerText} from "@/hooks/draft-tracker/timer-hooks.jsx";

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

    // Timer
    const timeAllowed = !!currentDraftStatus?.TIME_PER_SELECTION
        ? Number(currentDraftStatus.TIME_PER_SELECTION)
        : 0;
    const [remainingTime, setRemainingTime] = useState(timeAllowed);
    const [countDownText, setCountDownText] = useState(null);

    // Hooks for handling the context state
    useGetLeagueConfig(leagueName, session, status, setLeagueConfig);
    useGetLeagueDraftDetails(session, status, setCurrentDraftStatus);
    useGetCurrentDraftedRoster(leagueName, session, status, setRoster);
    useGetManagers(currentDraftStatus, setManagerObjects);
    useGetDraftQueue(draftQueue, setDraftQueue, currentDraftStatus, leagueConfig.draft, managerObjects)
    useCountDown(currentDraftStatus?.IS_RUNNING, setRemainingTime, timeAllowed, currentDraftStatus?.TIMESTAMP_OF_LAST_SELECTION);
    useUpdateTimerText(timeAllowed, remainingTime, setCountDownText);

    const startDraft = () =>
        Promise.all([
                resumeTimer(),
                setLeagueDraftIsRunning(leagueName, true, true)
            ]
        );

    const pauseTimer = () => setLeagueDraftIsRunning(leagueName, false);

    const resumeTimer = () => setLeagueDraftIsRunning(leagueName, true);

    const resetTimer = () => Promise.all([
        setRemainingTime(timeAllowed),
        setLeagueDraftIsRunning(leagueName, true)
    ]);

    switch (status) {
        case SESSION_CONSTANTS.LOADING:
            return <div>Loading...</div>
        case SESSION_CONSTANTS.AUTHENTICATED:
            return <DraftContext.Provider value={{
                authStatus: status,
                user: session?.user?.uid,
                teamName: session?.user?.team,
                leagueDraft: currentDraftStatus,
                draftQueue,
                roster,
                leagueName,
                isRunning: currentDraftStatus?.IS_RUNNING,
                setRemainingTime,
                timeAllowed,
                countDownText,
                draftRules: leagueConfig.draft,
                rosterConstruction: leagueConfig.roster_construction,
                scoringRules: leagueConfig.scoring,
                startDraft: startDraft,
                pauseTimer: pauseTimer,
                resumeTimer: resumeTimer,
                resetTimer: resetTimer,
                setDraftQueue: setDraftQueue
            }}>
                {children}
            </DraftContext.Provider>;
    }
};

export default DraftRoomContext;