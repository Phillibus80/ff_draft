'use client';

import styles from './roster.module.scss';
import {useContext, useState} from "react";
import {useSession} from "next-auth/react";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";
import {useGetAllLeagueRules} from "@/hooks/draft-tracker/draft-tracker-hooks.jsx";

const Roster = () => {
    const {data: session, status} = useSession();
    const {leagueName} = useContext(DraftContext);

    const [roster, setRoster] = useState({});
    useGetAllLeagueRules(leagueName, session, status, setRoster);

    return (
        <section className={styles.roster}>
            <h3 className={styles.roster_header}>Drafted Players</h3>
            {Object.entries(roster).map(([key, value]) =>
                <p key={key}>{key?.split('_')[0]} : {value}</p>)}
        </section>
    );
}

export default Roster;