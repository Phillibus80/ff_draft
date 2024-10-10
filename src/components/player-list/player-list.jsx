"use client";

import styles from './player-list.module.scss';
import {useContext, useState} from "react";
import {getTableBody, getTableHeaders} from "@/components/player-list/player-list-utils.jsx";
import {draftPlayer as draftPlayerDB} from "../../../lib/players/draftPlayer.js";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {useGetDraftPoolPlayers} from "@/hooks/players-hooks.jsx";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";

const PlayerList = () => {
    const {
        authStatus,
        leagueName,
        setDraftQueue,
        user,
        teamName,
        resetTimer,
        resumeTimer
    } = useContext(DraftContext);
    const [allPlayers, setAllPlayers] = useState({});
    const playerObjectArr = allPlayers && Object.values(allPlayers);

    useGetDraftPoolPlayers(setAllPlayers, authStatus);

    const draftPlayerWithSession = (leagueName, username, teamName) => (player) => {
        setDraftQueue(prev => prev.slice(1));
        resetTimer();
        return draftPlayerDB(leagueName, username, teamName, player);
    };

    const draftPlayer = draftPlayerWithSession(
        leagueName,
        user,
        teamName
    );

    return authStatus === SESSION_CONSTANTS.AUTHENTICATED
        ? (
            <section className={styles.playerListTable}>
                <table>
                    <thead>
                    <tr>
                        {getTableHeaders(playerObjectArr)}
                    </tr>
                    </thead>
                    <tbody>
                    {getTableBody(playerObjectArr, draftPlayer, user)}
                    </tbody>
                </table>
            </section>
        )
        : <div>Loading...</div>
}

export default PlayerList;