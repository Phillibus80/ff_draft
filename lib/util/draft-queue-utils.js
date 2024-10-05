/**
 * @typedef {import('../../../lib/jsdoc/types.js').DraftTypes} DraftTypes
 * @typedef {import('../../../lib/jsdoc/types.js').GetUserResponse} GetUserResponse
 */

import {DRAFT_TYPE_ENUM, DRAFT_TYPES} from "@/app-constants.js";
import {stripStr} from "./utils.js";

/**
 * A function that takes the draft style into consideration and generates the entire
 * draft order.
 *
 * @param {DraftTypes} draftStyle - which style of draft: snake, regular, auction
 * @param {number} numberOfRounds - the total number of rounds for the draft
 * @param {Array<string>} draftOrder - the order of the trade, an array of usernames
 * @param {Array<GetUserResponse>} managers - the data objects of the league managers
 * @return {Array<GetUserResponse>} - the entire draft order based on the draft style
 */
export const generateDraftQueue = (draftStyle, numberOfRounds, draftOrder, managers) => {
    const queue = [];
    if (!DRAFT_TYPE_ENUM.some(draftTypeEnum => draftTypeEnum === draftStyle)) return queue;
    const withMangersData = draftOrder.map(managerUsername =>
        managers.find(({USERNAME}) => stripStr(USERNAME) === stripStr(managerUsername)));

    switch (draftStyle) {
        case DRAFT_TYPES.SNAKE :
            for (let n = 0; n < numberOfRounds; n++) {
                if (n % 2 === 0 || n === 0) {
                    for (let i = 0; i < withMangersData.length; i++) {
                        queue.push(withMangersData[i]);
                    }
                } else {
                    for (let j = draftOrder.length - 1; j >= 0; j--) {
                        queue.push(withMangersData[j]);
                    }
                }
            }
            break;
        case DRAFT_TYPES.AUCTION :
        case DRAFT_TYPES.REGULAR :
            for (let n = 0; n < numberOfRounds; n++) {
                for (let i = 0; i < draftOrder.length; i++) {
                    queue.push(withMangersData[i]);
                }
            }
            break;
    }

    return queue;
}