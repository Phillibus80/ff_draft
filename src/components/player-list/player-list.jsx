import {getAllPlayers} from "../../../lib/players/playerStats";
import styles from './player-list.module.scss';

const PlayerList = async (season = 2024) => {
    const allPlayers = await getAllPlayers();
    const playerObjectArr = Object.values(allPlayers);
    const lastYear = season - 1;
    const isOneOfTheVisibleKeys = key => key === 'NAME' || key === 'POS' || key === 'FPTS';

    const getTableHeaders = (playerArr = []) => playerArr[0] && Object.keys(playerArr[0])
        .filter(key => key && isOneOfTheVisibleKeys(key))
        .map(key => <th key={key}>{key === 'FPTS' ? 'Total Fantasy Points' : key}</th>);

    const getTableBody = (playerArr = []) => {
        return playerArr.length > 0 && playerArr.map(player =>
            <tr key={`${player.NAME}_${lastYear}`}>
                {
                    Object.entries(player)
                        .filter(([key]) => key && isOneOfTheVisibleKeys(key))
                        .map(([statKey, playerStat]) =>
                            <td
                                className={statKey === 'FPTS' ? styles.statNumber : undefined}
                                key={`${player.NAME}_${lastYear}_${statKey}`}>
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