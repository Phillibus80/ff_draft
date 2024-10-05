"use client";

import * as styles from './draft-tracker.module.scss';

const TeamDraftCard = ({teamName, teamMoto, draftPosition}) => {
    return (
        <div className={styles.teamDraftCard}>
            <p>{teamName}</p>
            <p>{teamMoto}</p>
            <p>{draftPosition}</p>
        </div>
    );
}

export default TeamDraftCard;