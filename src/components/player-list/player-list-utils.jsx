import styles from './player-list.module.scss';
import {PLAYER_KEYS, PREVIOUS_YEAR} from "@/app-constants.js";

const isOneOfTheVisibleKeys = key => key === PLAYER_KEYS.NAME || key === PLAYER_KEYS.POSITION || key === PLAYER_KEYS.PTS;

export const getTableHeaders = (playerArr = []) => playerArr[0] && Object.keys(playerArr[0])
    .filter(key => key && isOneOfTheVisibleKeys(key))
    .map(
        key => <th key={key}>
            {key === PLAYER_KEYS.PTS ? 'Total Fantasy Points' : key}
        </th>
    );

export const getTableBody = (playerArr = [], draftPlayerCallback) => {
    return playerArr.length > 0
        && playerArr.map(
            player =>
                <tr
                    key={`${player.NAME}_${PREVIOUS_YEAR}`}
                    style={{cursor: 'pointer'}}
                    onClick={() => draftPlayerCallback(player)}
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