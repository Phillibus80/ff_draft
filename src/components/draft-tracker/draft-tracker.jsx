"use client";

import Timer from "@/components/draft-tracker/timer.jsx";
import {useContext} from "react";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";
import DraftQueue from "@/components/draft-tracker/draft-queue.jsx";
import * as styles from './draft-tracker.module.scss';
import {stripStr} from "../../../lib/util/utils.js";

const DraftTracker = () => {
    const {
        user,
        leagueDraft,
        draftQueue,
        draftRules,
        rosterConstruction,
        resetTimer,
        resumeTimer,
        pauseTimer,
        isRunning
    } = useContext(DraftContext);
    if (!leagueDraft || !draftRules || !rosterConstruction) return;

    const {
        COMMISSIONER: commish,
        CURRENT_DRAFT_POSITION: currentPos,
        TIMESTAMP_OF_LAST_SELECTION: timestampOfSelected,
        TIME_PER_SELECTION: timePerPick
    } = leagueDraft;

    const isUserCommissioner = stripStr(user) === stripStr(commish);

    return (<section className={styles.draft}>
        <Timer
            isCommish={isUserCommissioner}
            leagueDraft={leagueDraft}
            currentTime={timestampOfSelected}
            timeAllowed={timePerPick}
            resetTimer={resetTimer}
            resumeTimer={resumeTimer}
            pauseTimer={pauseTimer}
        />
        <DraftQueue
            draftQueue={draftQueue}
        />
    </section>);
};

export default DraftTracker;