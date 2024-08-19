import {getAllPlayers} from "@/api/players/playerStats";
import styles from './player-list.module.scss';

const PlayerList = async () => {
    const allPlayers = await getAllPlayers();

    const getTableHeaders = () => allPlayers[0] && Object.keys(allPlayers[0])
        .filter(key => key === 'NAME' || key === 'POS' || key === 'FPTS')
        .map(key => <th key={key}>{key === 'FPTS' ? 'Total Fantasy Points' : key}</th>);

    const getTableBody = () => {
        return allPlayers.length > 0 && allPlayers.map(player =>
            <tr key={`${player.NAME}_${player.YEAR}`}>{
                Object.entries(player)
                    .filter(([key]) => key === 'NAME' || key === 'POS' || key === 'FPTS')
                    .map(([statKey, playerStat]) => {
                        return (
                            <td
                                className={statKey === 'FPTS' ? styles.statNumber : undefined}
                                key={`${player.NAME}_${player.YEAR}_${statKey}`}>
                                {playerStat}
                            </td>
                        );
                    })
            }
            </tr>
        )
    };

    return (
        <section className={styles.playerListTable}>
            <table>
                <thead>
                <tr>
                    {getTableHeaders()}
                </tr>
                </thead>
                <tbody>
                {getTableBody()}
                </tbody>
            </table>
        </section>
    )
}

export default PlayerList;