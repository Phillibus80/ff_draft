import {getAllPlayers} from "../../api/players/playerStats";

const PlayerList = async () => {
    const allPlayers = await getAllPlayers();
    console.log('All Players:: ', allPlayers);

    const getTableHeaders = () => Object.keys(allPlayers[0]).map(key => <th key={key}>{key}</th>);

    const getTableBody = () => {
        return allPlayers.map(player =>
            <tr key={`${player.NAME}_${player.YEAR}`}>{
                Object.entries(player).map(([statKey, playerStat]) => {
                    return <td key={`${player.NAME}_${player.YEAR}_${statKey}`}>
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