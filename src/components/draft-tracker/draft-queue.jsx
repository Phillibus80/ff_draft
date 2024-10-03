"use client";

import TeamDraftCard from "@/components/draft-tracker/team-draft-card.jsx";
import {DRAFT_TYPE_ENUM, DRAFT_TYPES} from "@/app-constants.js";

const generateDraftQueue = (draftStyle, numberOfRounds, draftOrder) => {
    const queue = [];
    if (!DRAFT_TYPE_ENUM.some(draftTypeEnum => draftTypeEnum === draftStyle)) return queue;

    switch (draftStyle) {
        case DRAFT_TYPES.SNAKE :
            for (let n = 0; n < numberOfRounds; n++) {
                if (n % 2 === 0 || n === 0) {
                    for (let i = 0; i < draftOrder.length; i++) {
                        queue.push(draftOrder[i]);
                    }
                } else {
                    for (let j = draftOrder.length - 1; j >= 0; j--) {
                        queue.push(draftOrder[j]);
                    }
                }
            }
            break;
        case DRAFT_TYPES.AUCTION :
        case DRAFT_TYPES.REGULAR :
            for (let n = 0; n < numberOfRounds; n++) {
                for (let i = 0; i < draftOrder.length; i++) {
                    queue.push(draftOrder[i]);
                }
            }
            break;
    }

    return queue;
}

const DraftQueue = ({activeDraft, draftOrder, currentPosition, rules}) => {
    const {
        draftStyle,
        numberOfRounds
    } = rules;
    const draftQueue = generateDraftQueue(draftStyle, numberOfRounds, draftOrder);
    console.log('Active Draft:: ', draftQueue);

    return <>
        {
            draftQueue?.length > 0
            && draftQueue.map(
                (teamName, index) =>
                    <TeamDraftCard
                        key={`${teamName}-${index}`}
                        teamName={teamName}
                    />
            )
        }
    </>
};

export default DraftQueue;