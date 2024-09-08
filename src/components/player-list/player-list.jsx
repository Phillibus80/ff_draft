"use client";

import {getDraftPoolPlayers} from "../../../lib/players/playerStats";
import styles from './player-list.module.scss';
import {useEffect, useState} from "react";
import {getTableBody, getTableHeaders} from "@/components/player-list/player-list-utils.jsx";
import {useSession} from "next-auth/react";
import {draftPlayer as draftPlayerDB} from "../../../lib/players/draftPlayer.js";
import {getLeagueFromSession} from "../../../lib/util/utils.js";

const PlayerList = () => {
    const {data: session, status} = useSession();
    const [allPlayers, setAllPlayers] = useState({});
    const playerObjectArr = allPlayers && Object.values(allPlayers);
    const sessionLeague = getLeagueFromSession(session, status);

    useEffect(() => {
        getDraftPoolPlayers(setAllPlayers);
    }, []);

    const draftPlayerWithSession = (leagueName, username, teamName) =>
        player => draftPlayerDB(leagueName, username, teamName, player);

    const draftPlayer = draftPlayerWithSession(
        sessionLeague,
        session?.user?.username,
        session?.user?.team
    );

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