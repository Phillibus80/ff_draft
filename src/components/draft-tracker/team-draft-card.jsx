"use client";

import * as styles from './draft-tracker.module.scss';

const TeamDraftCard = ({teamName}) => {
    return (
        <div className={styles.teamDraftCard}>
            <p>{teamName}</p>
        </div>
    );
}

export default TeamDraftCard;