'use server';

import {getAllRules} from "../../../lib/rules/rules.js";
import styles from './roster.module.scss';
import {getRosterSlots} from "@/util/utils.js";

const Roster = async () => {
    const {rosterconstruction} = await getAllRules();

    const rosterSlots = getRosterSlots(rosterconstruction);

    return (
        <section className={styles.roster}>
            <h3 className={styles.roster_header}>Drafted Players</h3>
            {rosterSlots.map(slot => slot)}
        </section>
    );
}

export default Roster;