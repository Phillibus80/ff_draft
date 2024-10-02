'use client';

import styles from './roster.module.scss';
import {useContext} from "react";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";

const Roster = () => {
    const {leagueRules} = useContext(DraftContext);
    if (!leagueRules) return;

    const ruleEntries = Object.entries(leagueRules);

    return ruleEntries.length > 0
        ? (
            <section className={styles.roster}>
                <h3 className={styles.roster_header}>Drafted Players</h3>
                {ruleEntries.map(([key, value]) =>
                    <p key={key}>{key?.split('_')[0]} : {value}</p>)}
            </section>
        )
        : '';
}

export default Roster;