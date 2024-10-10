"use client";

import styles from './player-list.module.scss';
import {useContext, useState} from "react";
import {getTableBody, getTableHeaders} from "@/components/player-list/player-list-utils.jsx";
import {draftPlayer as draftPlayerDB} from "../../../lib/players/draftPlayer.js";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {useGetDraftPoolPlayers} from "@/hooks/players-hooks.jsx";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";
import {stripStr} from "../../../lib/util/utils.js";

const PlayerList = () => {
    const {
        authStatus,
        leagueName,
        draftQueue,
        setDraftQueue,
        user,
        teamName,
        resetTimer
    } = useContext(DraftContext);
    const [allPlayers, setAllPlayers] = useState({});
    const playerObjectArr = allPlayers && Object.values(allPlayers);
    const isOnTheClock = stripStr(user) === stripStr(draftQueue[0]?.USERNAME);

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

    switch (authStatus) {
        case SESSION_CONSTANTS.AUTHENTICATED:
            return <section className={styles.playerListTable}>
                <table>
                    <thead>
                    <tr>
                        {getTableHeaders(playerObjectArr)}
                    </tr>
                    </thead>
                    <tbody>
                    {getTableBody(playerObjectArr, draftPlayer, isOnTheClock, user)}
                    </tbody>
                </table>
            </section>;
        case SESSION_CONSTANTS.LOADING :
            return <div>Loading...</div>;
    }
}

export default PlayerList;