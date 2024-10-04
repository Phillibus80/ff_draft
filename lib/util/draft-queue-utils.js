import {DRAFT_TYPE_ENUM, DRAFT_TYPES} from "@/app-constants.js";

export const generateDraftQueue = (draftStyle, numberOfRounds, draftOrder) => {
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