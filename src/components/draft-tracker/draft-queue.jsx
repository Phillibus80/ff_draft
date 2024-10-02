"use client";

import TeamDraftCard from "@/components/draft-tracker/team-draft-card.jsx";

const DraftQueue = ({draftOrder, currentPosition}) => {
    console.log('Current position', currentPosition);
    return <>
        {
            draftOrder.length > 0
            && draftOrder.map(teamName => <TeamDraftCard teamName={teamName}/>)
        }
    </>
};

export default DraftQueue;