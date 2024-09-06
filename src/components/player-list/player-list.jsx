"use client";

import {getDraftPoolPlayers} from "../../../lib/players/playerStats";
import styles from './player-list.module.scss';
import {useEffect, useState} from "react";
import {getTableBody, getTableHeaders} from "@/components/player-list/player-list-utils.jsx";

const PlayerList = () => {
    const [allPlayers, setAllPlayers] = useState({});
    const playerObjectArr = allPlayers && Object.values(allPlayers);

    useEffect(() => {
        getDraftPoolPlayers(setAllPlayers);
    }, []);

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