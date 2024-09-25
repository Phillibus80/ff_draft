"use client";

import Timer from "@/components/draft-tracker/timer.jsx";
import {useContext} from "react";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";
import DraftQueue from "@/components/draft-tracker/draft-queue.jsx";

const DraftTracker = () => {
    const draftContext = useContext(DraftContext);
    if (!draftContext?.leagueDraft?.COMMISSIONER) return;


    const {
        COMMISSIONER: commish,
        CURRENT_DRAFT_POSITION: currentPos,
        DRAFT_ORDER: draftOrder,
        TIMESTAMP_OF_LAST_SELECTION: timestampOfSelected,
        TIME_PER_SELECTION: timePerPick
    } = draftContext;

    return (<>
        <Timer
            currentTime={timestampOfSelected}
            timeAllowed={timePerPick}
        />
        <DraftQueue/>
    </>);
};

export default DraftTracker;