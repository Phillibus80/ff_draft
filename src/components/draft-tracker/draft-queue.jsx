"use client";

import TeamDraftCard from "@/components/draft-tracker/team-draft-card.jsx";

const DraftQueue = ({draftQueue}) => {
    return <>
        {
            draftQueue?.length > 0
            && !!draftQueue[0]?.TEAM_NAME
            && draftQueue.map(({TEAM_NAME, TEAM_MOTO}, index) =>
                <TeamDraftCard
                    key={`${TEAM_NAME}-${index}`}
                    teamName={TEAM_NAME}
                    teamMoto={TEAM_MOTO}
                    draftPosition={index + 1}
                />)}
    </>
};

export default DraftQueue;