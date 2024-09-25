'use client';

import styles from './roster.module.scss';
import {useContext, useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {stripStr} from "../../../lib/util/utils.js";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";
import {getAllRules} from "../../../lib/rules/rules.js";

const Roster = () => {
    const {data: session, status} = useSession();
    const {leagueName} = useContext(DraftContext);
    console.log('LM:: ', session);

    const [roster, setRoster] = useState({});
    const [rules, setRules] = useState({});

    useEffect(() => {
        const leagueKey = stripStr(leagueName);
        let unsubscribe;

        if (status === SESSION_CONSTANTS.AUTHENTICATED) {
            getAllRules(leagueKey).then(res => {
                console.log('Rules: ', res)
                // const rosterConstruction = rules[`${leagueName}`];
                // // const rosterMap = getRosterSlots(rosterConstruction);
                // console.log('RC:: ', rosterConstruction);
                // // console.log('RM:: ', rosterMap);
            })

            console.log('League Key:: ', leagueKey);

            // const leagueKey = getLeagueFromSession(session, status);
            // const teamKey = stripStr(session?.user?.team);
            // unsubscribe = getDraftedPlayers(leagueKey, teamKey, rosterMap, setRoster);
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