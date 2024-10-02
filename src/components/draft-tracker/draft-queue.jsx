"use client";

import {useContext} from "react";
import {DraftContext} from "@/context/draft-room-context/draft-room-context.jsx";

const DraftQueue = () => {
    const {draftRules, rosterConstruction} = useContext(DraftContext);
    console.log('Draft Rules:: ', draftRules);
    console.log('Roster Construction:: ', rosterConstruction);
    return (
        <>Hello</>
    );
};

export default DraftQueue;