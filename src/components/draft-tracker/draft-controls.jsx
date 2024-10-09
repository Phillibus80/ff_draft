"use client";

import styles from "@/components/draft-tracker/draft-tracker.module.scss";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";
import {useContext, useState} from "react";

const DraftControls = (
    {
        timeAllowed,
        setRemainingTime
    }
) => {
    const {
        startDraft,
        resetTimer,
        resumeTimer,
        pauseTimer
    } = useContext(DraftContext);
    const [draftStarted, setDraftStarted] = useState(false);

    return (
        <div className={styles.button_group}>
            <button
                onClick={() =>
                    Promise.all([
                            startDraft(),
                            setDraftStarted(true)
                        ]
                    )
                }
                disabled={draftStarted}
            >
                Start Draft
            </button>

            <button
                onClick={pauseTimer}
                disabled={!draftStarted}
            >
                Pause Draft
            </button>

            <button
                disabled={!draftStarted}
                onClick={resumeTimer}
            >
                Resume Draft
            </button>

            <button
                disabled={!draftStarted}
                onClick={() => {
                    resetTimer();
                    setRemainingTime(timeAllowed);
                }}
            >
                Reset Draft
            </button>
        </div>
    )
};

export default DraftControls;