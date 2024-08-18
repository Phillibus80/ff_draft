import {getAllPlayers} from "@/api/players/playerStats";

const PlayerList = async () => {
    const allPlayers = await getAllPlayers();

    const getTableHeaders = () => allPlayers[0] && Object.keys(allPlayers[0])
        .filter(key => key !== 'id')
        .map(key => <th key={key}>{key}</th>);

    const getTableBody = () => {
        return allPlayers.length > 0 && allPlayers.map(player =>
            <tr key={`${player.NAME}_${player.YEAR}`}>{
                Object.entries(player).map(([statKey, playerStat]) => {
                    return statKey !== 'id'
                        && <td key={`${player.NAME}_${player.YEAR}_${statKey}`}>
                            {playerStat}
                        </td>
                })
            }</tr>)
    };

    return (
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
    )
}

export default PlayerList;