"use client";

import * as styles from './draft-tracker.module.scss';

const TeamDraftCard = ({teamName, teamMoto, draftPosition}) => {
    if (!teamName || !teamMoto) return null;

    const NUM_CHAR_SHOWN = 55;

    const modifyTeamMoto = moto => moto.split("").length > NUM_CHAR_SHOWN
        ? moto.split('').slice(0, NUM_CHAR_SHOWN).join('') + '...'
        : moto;

    return (
        <div className={styles.teamDraftCard}>
            <h3 className={styles.teamDraftCard_name}>{teamName}</h3>
            <p className={styles.teamDraftCard_moto}>{modifyTeamMoto(teamMoto)}</p>
            <p className={styles.teamDraftCard_pos}>{draftPosition}</p>
        </div>
    );
}

export default TeamDraftCard;