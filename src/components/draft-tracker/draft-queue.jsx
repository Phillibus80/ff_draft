"use client";

import TeamDraftCard from "@/components/draft-tracker/team-draft-card.jsx";

const DraftQueue = ({draftQueue, currentDraftPosition}) => {
    if (draftQueue?.length === 0 || !draftQueue[0]?.TEAM_NAME) return;

    const currentDraftQueue = draftQueue.slice(currentDraftPosition - 1);

    return <>
        {
            currentDraftQueue.map(({TEAM_NAME, TEAM_MOTO}, index) =>
                <TeamDraftCard
                    key={`${TEAM_NAME}-${index}`}
                    teamName={TEAM_NAME}
                    teamMoto={TEAM_MOTO}
                    draftPosition={index + 1}
                />)}
    </>
};

export default DraftQueue;