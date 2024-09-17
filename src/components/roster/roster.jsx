'use client';

import styles from './roster.module.scss';
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {getDraftedPlayers} from "../../../lib/players/draftPlayer.js";
import {getLeagueFromSession, stripStr} from "../../../lib/util/utils.js";
import {SESSION_CONSTANTS} from "@/app-constants.js";

const Roster = ({rosterMap}) => {
    const {data: session, status} = useSession();
    const [roster, setRoster] = useState({});

    useEffect(() => {
        let unsubscribe;

        if (status === SESSION_CONSTANTS.AUTHENTICATED) {
            const leagueKey = getLeagueFromSession(session, status);
            const teamKey = stripStr(session?.user?.team);

            unsubscribe = getDraftedPlayers(leagueKey, teamKey, rosterMap, setRoster);
        }

        return () => unsubscribe && unsubscribe();
    }, [status]);

    return (
        <section className={styles.roster}>
            <h3 className={styles.roster_header}>Drafted Players</h3>
            {Object.entries(roster).map(([key, value]) =>
                <p key={key}>{key?.split('_')[0]} : {value}</p>)}
        </section>
    );
}

export default Roster;