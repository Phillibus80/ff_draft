'use server';

import {getAllRules} from "../../../lib/rules/rules.js";
import {getRosterSlots} from "../../../lib/util/roster-utils.js";
import Roster from "@/components/roster/roster.jsx";

const RosterContainer = async () => {
    const {roster_construction} = await getAllRules();

    const rosterSlots = getRosterSlots(roster_construction);

    return <Roster rosterMap={rosterSlots}/>;
}

export default RosterContainer;