"use client";

import {useCountDown, useUpdateTimerText} from "@/hooks/draft-tracker/timer-hooks.jsx";
import styles from './draft-tracker.module.scss';
import {useState} from "react";
import DraftControls from "@/components/draft-tracker/draft-controls.jsx";

const Timer = (
    {
        currentTime,
        isCommish,
        isRunning,
        timeAllowed
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
                    setRemainingTime={setRemainingTime}
                />
            }
        </section>
    );
};

export default Timer;
