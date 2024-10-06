"use client";

import {useCountDown, useUpdateTimerText} from "@/hooks/draft-tracker/timer-hooks.jsx";
import styles from './draft-tracker.module.scss';
import {useEffect, useState} from "react";

const Timer = (
    {
        leagueDraft,
        currentTime,
        timeAllowed,
        isRunning,
        resetTimer,
        resumeTimer,
        pauseTimer
    }
) => {
    const [remainingTime, setRemainingTime] = useState(timeAllowed);
    const [countDownText, setCountDownText] = useState('');

    useCountDown(isRunning, setRemainingTime, timeAllowed, currentTime);
    useUpdateTimerText(timeAllowed, remainingTime, setCountDownText);

    // Resets the timer when someone drafts a player
    useEffect(() => {
        if (Object.keys(leagueDraft)?.length > 0) {
            console.log(timeAllowed);
            setRemainingTime(timeAllowed);
        }
    }, [leagueDraft]);

    return (
        <section className={styles.timer}>
            <p>{countDownText}</p>

            <div className={styles.button_group}>
                <button onClick={() => {
                    resetTimer();
                    resumeTimer();
                }}>
                    Start Draft
                </button>

                <button onClick={pauseTimer}>
                    Pause Draft
                </button>

                <button onClick={resumeTimer}>
                    Resume Draft
                </button>

                <button onClick={() => {
                    resetTimer();
                    setRemainingTime(timeAllowed);
                }}
                >
                    Reset Draft
                </button>
            </div>
        </section>
    );
};

export default Timer;
