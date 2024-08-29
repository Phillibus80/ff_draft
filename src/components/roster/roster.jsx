'use server';

import {getAllRules} from "../../../lib/rules/rules.js";
import {POSITIONS} from "../../../app-constants.js";
import styles from './roster.module.scss';

const Roster = async () => {
    const rules = await getAllRules();
    const {
        starterPositions,
        totalNumberOfPlayersAllowed,
        benchPlayersAllowed,
        flexAllowed,
        opAllowed
    } = rules?.rosterconstruction;

    const positionOrder = [
        POSITIONS.QB,
        POSITIONS.RB,
        POSITIONS.WR,
        POSITIONS.TE,
        POSITIONS.OP,
        POSITIONS.FLEX,
        POSITIONS.DEF,
        POSITIONS.K
    ];

    const startersArr = opAllowed
        ? Object.entries({...starterPositions, [POSITIONS.OP]: 1})
        : Object.entries(starterPositions);
    const sortedStarters = positionOrder.map(
        position => startersArr.find(
            ([key]) => position === key
        )
    );
    const getRosterSlots = () => sortedStarters
        .reduce(
            (accum, current) => {
                const [pos, numAllowed] = current;

                for (let n = 0; n < numAllowed; n++) {
                    accum.push(<p>{pos}:</p>);
                }
                return accum;
            }, []);

    const rosterSlots = getRosterSlots();

    const getBenchPlayers = () => {
        const numberOfBenchSpots = totalNumberOfPlayersAllowed - rosterSlots
    };

    return (
        <section className={styles.roster}>
            <h3 className={styles.roster_header}>Drafted Players</h3>
            {rosterSlots()}
        </section>
    );
}

export default Roster;