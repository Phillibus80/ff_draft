"use client";

import {createContext, useEffect, useState} from "react";
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
    useGetLeagueDraftDetails(session, status, setCurrentDraftStatus);
    useGetCurrentDraftedRoster(leagueName, session, status, setRoster);
    const timeAllowed = !!currentDraftStatus?.TIME_PER_SELECTION
        ? Number(currentDraftStatus.TIME_PER_SELECTION)
        : 0;

    // Timer State
    const [remainingTime, setRemainingTime] = useState(timeAllowed);
    const [countDownText, setCountDownText] = useState('');
    const [isRunning, setIsRunning] = useState(true);

    // Resets the timer when someone drafts a player
    useEffect(() => {
        if (Object.keys(currentDraftStatus)?.length > 0) {
            setRemainingTime(timeAllowed);
        }
    }, [currentDraftStatus]);

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
                remainingTime,
                setRemainingTime,
                countDownText,
                setCountDownText,
                isRunning,
                setIsRunning,
                timeAllowed,
                draftRules: leagueRules.draft,
                rosterConstruction: leagueRules.roster_construction,
                scoringRules: leagueRules.scoring,
                pauseTimer: () => {
                    setIsRunning(false);
                },
                resumeTimer: () => {
                    setIsRunning(true);
                },
                resetTimer: () => {
                    setRemainingTime(timeAllowed);
                    setIsRunning(false);
                }
            }}>
                {children}
            </DraftContext.Provider>
        );
};

export default DraftRoomContext;