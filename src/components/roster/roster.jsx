'use client';

import styles from './roster.module.scss';
import {useContext, useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {stripStr} from "../../../lib/util/utils.js";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";
import {getAllRules} from "../../../lib/rules/rules.js";
import {getRosterSlots} from "../../../lib/util/roster-utils.js";
import {getDraftedPlayers} from "../../../lib/players/draftPlayer.js";

const Roster = () => {
    const {data: session, status} = useSession();
    const {leagueName} = useContext(DraftContext);

    const [roster, setRoster] = useState({});

    useEffect(() => {
        const leagueKey = stripStr(leagueName);
        let unsubscribe;

        if (status === SESSION_CONSTANTS.AUTHENTICATED) {
            // Build the roster template based on the
            // rules set
            getAllRules(leagueKey)
                .then(res => {
                    const {config: {roster_construction}} = res;

                    const rosterMap = getRosterSlots(roster_construction);

                    // Populate the roster with drafted players
                    const teamKey = stripStr(session?.user?.team);
                    unsubscribe = getDraftedPlayers(leagueKey, teamKey, rosterMap, setRoster);
                    setRoster(prevRosterMap => ({...rosterMap, ...prevRosterMap}));
                })
        }

        // Clean up
        return () => unsubscribe ? unsubscribe() : null;
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