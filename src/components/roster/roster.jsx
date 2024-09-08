'use client';

import styles from './roster.module.scss';
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {getDraftedPlayers} from "../../../lib/players/draftPlayer.js";
import {getLeagueFromSession, stripStr} from "../../../lib/util/utils.js";

const Roster = ({rosterMap}) => {
    const {data: session, status} = useSession();
    const [roster, setRoster] = useState({});

    useEffect(() => {
        if (status === 'authenticated') {
            const leagueKey = getLeagueFromSession(session, status);
            const teamKey = stripStr(session?.user?.team);

            getDraftedPlayers(leagueKey, teamKey, rosterMap, setRoster);
        }
    }, [status]);

    console.log('Roster:: ', roster);

    return (
        <section className={styles.roster}>
            <h3 className={styles.roster_header}>Drafted Players</h3>
            {/*{rosterSlots.map(slot => slot)}*/}
        </section>
    );
}

export default Roster;