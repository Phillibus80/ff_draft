"use client";

import TeamDraftCard from "@/components/draft-tracker/team-draft-card.jsx";
import {generateDraftQueue} from "../../../lib/util/draft-queue-utils.js";

const DraftQueue = ({activeDraft, draftOrder, currentPosition, rules}) => {
    const {
        draftStyle, numberOfRounds
    } = rules;
    const draftQueue = generateDraftQueue(draftStyle, numberOfRounds, draftOrder);

    return <>
        {draftQueue?.length > 0 && draftQueue.map((teamName, index) => <TeamDraftCard
            key={`${teamName}-${index}`}
            teamName={teamName}
        />)}
    </>
};

export default DraftQueue;