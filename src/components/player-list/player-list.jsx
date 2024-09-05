import {getAllPlayers} from "../../../lib/players/playerStats";
import styles from './player-list.module.scss';
import {PLAYER_KEYS, PREVIOUS_YEAR} from "@/app-constants.js";

const PlayerList = async () => {
    const allPlayers = await getAllPlayers();
    const playerObjectArr = Object.values(allPlayers);

    const isOneOfTheVisibleKeys = key => key === PLAYER_KEYS.NAME || key === PLAYER_KEYS.POSITION || key === PLAYER_KEYS.PTS;

    const getTableHeaders = (playerArr = []) => playerArr[0] && Object.keys(playerArr[0])
        .filter(key => key && isOneOfTheVisibleKeys(key))
        .map(key => <th key={key}>{key === PLAYER_KEYS.PTS ? 'Total Fantasy Points' : key}</th>);

    const getTableBody = (playerArr = []) => {
        return playerArr.length > 0 && playerArr.map(player =>
            <tr key={`${player.NAME}_${PREVIOUS_YEAR}`}>
                {
                    Object.entries(player)
                        .filter(([key]) => key && isOneOfTheVisibleKeys(key))
                        .map(([statKey, playerStat]) =>
                            <td
                                className={statKey === PLAYER_KEYS.PTS ? styles.statNumber : undefined}
                                key={`${player.NAME}_${PREVIOUS_YEAR}_${statKey}`}>
                                {playerStat}
                            </td>
                        )
                }
            </tr>
        )
    };

    return (
        <section className={styles.playerListTable}>
            <table>
                <thead>
                <tr>
                    {getTableHeaders(playerObjectArr)}
                </tr>
                </thead>
                <tbody>
                {getTableBody(playerObjectArr)}
                </tbody>
            </table>
        </section>
    )
}

export default PlayerList;