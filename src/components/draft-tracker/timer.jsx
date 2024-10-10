"use client";

import styles from './draft-tracker.module.scss';
import DraftControls from "@/components/draft-tracker/draft-controls.jsx";

const Timer = ({
                   countDownText,
                   isCommish,
                   setRemainingTime,
                   timeAllowed
               }) => {
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
