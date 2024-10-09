"use client";

import {useCountDown, useUpdateTimerText} from "@/hooks/draft-tracker/timer-hooks.jsx";
import styles from './draft-tracker.module.scss';
import {useState} from "react";
import DraftControls from "@/components/draft-tracker/draft-controls.jsx";

const Timer = (
    {
        currentTime,
        timeAllowed,
        isRunning,
        resetTimer,
        resumeTimer,
        pauseTimer,
        isCommish
    }
) => {
    const [remainingTime, setRemainingTime] = useState(timeAllowed);
    const [countDownText, setCountDownText] = useState('');

    useCountDown(isRunning, setRemainingTime, timeAllowed, currentTime);
    useUpdateTimerText(timeAllowed, remainingTime, setCountDownText);

    return (
        <section className={styles.timer}>
            <p>{countDownText}</p>

            {
                isCommish &&
                <DraftControls
                    timeAllowed={timeAllowed}
                    resetTimer={resetTimer}
                    resumeTimer={resumeTimer}
                    pauseTimer={pauseTimer}
                    setRemainingTime={setRemainingTime}
                    remainingTime={remainingTime}
                />
            }
        </section>
    );
};

export default Timer;
