"use client";

import styles from './player-list.module.scss';
import {useContext, useState} from "react";
import {getTableBody, getTableHeaders} from "@/components/player-list/player-list-utils.jsx";
import {useSession} from "next-auth/react";
import {draftPlayer as draftPlayerDB} from "../../../lib/players/draftPlayer.js";
import {getLeagueFromSession} from "../../../lib/util/utils.js";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {useGetDraftPoolPlayers} from "@/hooks/players-hooks.jsx";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";

const PlayerList = () => {
    const {data: session, status} = useSession();
    const {setDraftQueue} = useContext(DraftContext);
    const [allPlayers, setAllPlayers] = useState({});
    const playerObjectArr = allPlayers && Object.values(allPlayers);
    const sessionLeague = getLeagueFromSession(session, status);

    useGetDraftPoolPlayers(setAllPlayers, status);

    const draftPlayerWithSession = (leagueName, username, teamName) => (player) => {
        setDraftQueue(prev => prev.slice(1));
        return draftPlayerDB(leagueName, username, teamName, player);
    };

    const draftPlayer = draftPlayerWithSession(
        sessionLeague,
        session?.user?.username,
        session?.user?.team
    );

    return status === SESSION_CONSTANTS.AUTHENTICATED
        ? (
            <section className={styles.playerListTable}>
                <table>
                    <thead>
                    <tr>
                        {getTableHeaders(playerObjectArr)}
                    </tr>
                    </thead>
                    <tbody>
                    {getTableBody(playerObjectArr, draftPlayer, session.user.username)}
                    </tbody>
                </table>
            </section>
        )
        : <div>Loading...</div>
}

export default PlayerList;