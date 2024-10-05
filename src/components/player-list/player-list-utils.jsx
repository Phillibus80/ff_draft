/**
 * @typedef {import('../../../lib/jsdoc/types.js').draftPlayerConfig} draftPlayerConfig
 */

import styles from './player-list.module.scss';
import {PLAYER_KEYS, PREVIOUS_YEAR} from "@/app-constants.js";

const isOneOfTheVisibleKeys = key => key === PLAYER_KEYS.NAME || key === PLAYER_KEYS.POSITION || key === PLAYER_KEYS.PTS;

/**
 * A helper function to generate jsx table header elements.
 *
 * @param {Array<draftPlayerConfig>} playerArr - the array of players in the draft pool
 * @return {*|Array<JSX.Element>} - the th elements
 */
export const getTableHeaders = (playerArr = []) => playerArr[0] && Object.keys(playerArr[0])
    .filter(key => key && isOneOfTheVisibleKeys(key))
    .map(
        key => <th
            className={'playerList_header'}
            key={key}>
            {key === PLAYER_KEYS.PTS ? 'Total Fantasy Points' : key}
        </th>
    );

/**
 * A helper function to generate jsx table row and table data elements.
 *
 * @param {Array<draftPlayerConfig>} playerArr - the array of players in the draft pool
 * @param {function} draftPlayerCallback - the setState callback that sets the drafted player
 * @param {string} username - the username key
 * @return {false|Array<JSX.Element>} - the tr and td elements
 */
export const getTableBody = (playerArr = [], draftPlayerCallback, username) => {
    return playerArr.length > 0
        && playerArr.map(
            player =>
                <tr
                    key={`${player.NAME}_${PREVIOUS_YEAR}`}
                    style={{cursor: 'pointer'}}
                    onClick={() => draftPlayerCallback(player, username)}
                >
                    {
                        Object.entries(player)
                            .filter(([key]) => key && isOneOfTheVisibleKeys(key))
                            .map(([statKey, playerStat]) =>
                                <td
                                    className={statKey === PLAYER_KEYS.PTS ? styles.statNumber : undefined}
                                    key={`${player.NAME}_${PREVIOUS_YEAR}_${statKey}`}
                                >
                                    {playerStat}
                                </td>
                            )
                    }
                </tr>
        )
};