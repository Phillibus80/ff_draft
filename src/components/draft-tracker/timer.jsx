"use client";

import {useCountDown, useUpdateTimerText} from "@/hooks/draft-tracker/timer-hooks.jsx";
import styles from './draft-tracker.module.scss';
import {useContext} from "react";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";

const Timer = ({currentTime, timeAllowed}) => {
    const {
        resetTimer,
        resumeTimer,
        pauseTimer,
        isRunning,
        remainingTime,
        setRemainingTime,
        countDownText,
        setCountDownText
    } = useContext(DraftContext);

    useCountDown(isRunning, setRemainingTime, timeAllowed, currentTime);
    useUpdateTimerText(remainingTime, setCountDownText);

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

                <button onClick={resetTimer}
                >
                    Reset Draft
                </button>
            </div>
        </section>
    );
};

export default Timer;
