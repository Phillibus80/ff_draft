"use client";

import {getDraftPoolPlayers} from "../../../lib/players/playerStats";
import styles from './player-list.module.scss';
import {useEffect, useState} from "react";
import {getTableBody, getTableHeaders} from "@/components/player-list/player-list-utils.jsx";
import {useSession} from "next-auth/react";
import {draftPlayer} from "../../../lib/players/draftPlayer.js";

const PlayerList = () => {
    const {data: session, status} = useSession();
    console.log("session", session);
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
                {getTableBody(playerObjectArr, draftPlayer)}
                </tbody>
            </table>
        </section>
    )
}

export default PlayerList;