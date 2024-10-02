"use client";

import {createContext, useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useGetLeagueDraftDetails} from "@/hooks/draft-tracker/draft-tracker-hooks.jsx";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {useFirebaseSignInWithCustomToken, useRerouteIfUnauthenticated} from "@/hooks/hooks.jsx";

export const DraftContext = createContext(null);

const DraftRoomContext = ({children}) => {
    // Session Tasks
    const {data: session, status} = useSession();

    useRerouteIfUnauthenticated(status);
    useFirebaseSignInWithCustomToken(session?.user?.customToken);

    const leagueName = 'da_league';

    // League Draft Details
    const draftDetails = useGetLeagueDraftDetails(session, status);
    const timeAllowed = !!draftDetails?.TIME_PER_SELECTION ? Number(draftDetails.TIME_PER_SELECTION) : 0;

    // Timer State
    const [remainingTime, setRemainingTime] = useState(timeAllowed);
    const [countDownText, setCountDownText] = useState('');
    const [isRunning, setIsRunning] = useState(true);

    // Resets the timer when someone drafts a player
    useEffect(() => {
        if (Object.keys(draftDetails)?.length > 0) {
            setRemainingTime(timeAllowed);
        }
    }, [draftDetails]);

    return status === SESSION_CONSTANTS.LOADING
        ? <div>Loading...</div>
        : (
            <DraftContext.Provider value={{
                leagueDraft: draftDetails,
                leagueName,
                remainingTime,
                setRemainingTime,
                countDownText,
                setCountDownText,
                isRunning,
                setIsRunning,
                timeAllowed,
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