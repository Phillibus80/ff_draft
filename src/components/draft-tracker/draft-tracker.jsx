"use client";

import Timer from "@/components/draft-tracker/timer.jsx";
import {useContext} from "react";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";
import DraftQueue from "@/components/draft-tracker/draft-queue.jsx";
import * as styles from './draft-tracker.module.scss';

const DraftTracker = () => {
    const {leagueDraft, draftRules, rosterConstruction} = useContext(DraftContext);
    if (!leagueDraft || !draftRules || !rosterConstruction) return;

    const {
        COMMISSIONER: commish,
        CURRENT_DRAFT_POSITION: currentPos,
        DRAFT_ORDER: draftOrder,
        TIMESTAMP_OF_LAST_SELECTION: timestampOfSelected,
        TIME_PER_SELECTION: timePerPick
    } = leagueDraft;

    return (<section className={styles.draft}>
        <Timer
            currentTime={timestampOfSelected}
            timeAllowed={timePerPick}
        />
        <DraftQueue
            currentPosition={currentPos}
            draftOrder={draftOrder}
        />
    </section>);
};

export default DraftTracker;