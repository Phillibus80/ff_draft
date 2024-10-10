"use client";

import Timer from "@/components/draft-tracker/timer.jsx";
import {useContext} from "react";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";
import DraftQueue from "@/components/draft-tracker/draft-queue.jsx";
import * as styles from './draft-tracker.module.scss';
import {stripStr} from "../../../lib/util/utils.js";

const DraftTracker = () => {
    const {
        draftRules,
        draftQueue,
        setRemainingTime,
        leagueDraft,
        rosterConstruction,
        user,
        countDownText
    } = useContext(DraftContext);
    if (!leagueDraft || !draftRules || !rosterConstruction) return;

    const {
        COMMISSIONER: commish,
        CURRENT_DRAFT_POSITION: currentPos,
        TIME_PER_SELECTION: timePerPick
    } = leagueDraft;

    const isUserCommissioner = stripStr(user) === stripStr(commish);

    return (<section className={styles.draft}>
        <Timer
            countDownText={countDownText}
            isCommish={isUserCommissioner}
            setRemainingTime={setRemainingTime}
            timeAllowed={timePerPick}
        />
        <DraftQueue
            draftQueue={draftQueue}
        />
    </section>);
};

export default DraftTracker;