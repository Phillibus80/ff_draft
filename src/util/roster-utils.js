import {positionVisualOrder} from "../../app-constants.js";

function sortPositions(positions) {
    const startersArr = Object.entries(positions);

    return positionVisualOrder
        .map(
            position => startersArr.find(
                ([key]) => position === key
            ))
        .filter(pos => !!pos);
}

function getStarterSlots(sortedStarters) {
    return sortedStarters.reduce(
        (accum, current) => {
            const [pos, numAllowed] = current;

            for (let n = 0; n < numAllowed; n++) {
                accum.push(<p key={`${pos}_${n}`}>{pos}:</p>);
            }
            return accum;
        }, []);
}

function getBenchSlots(
    totalNumberOfPlayersAllowed,
    numberOfBenchPlayersAllowed,
    starterLength
) {
    const benchSlotArr = [];
    const numberOfBenchSpots = Number(totalNumberOfPlayersAllowed) - starterLength;
    const numberOfIterations = (numberOfBenchSpots <= numberOfBenchPlayersAllowed)
        ? numberOfBenchSpots
        : numberOfBenchPlayersAllowed;

    for (let n = 0; n < numberOfIterations; n++) {
        benchSlotArr.push(<p key={`bench_${n}`}>Bench:</p>);
    }

    return benchSlotArr;
}

export const getRosterSlots = rosterConstruction => {
    const {
        starterPositions,
        totalNumberOfPlayersAllowed,
        benchPlayersAllowed
    } = rosterConstruction;

    const sortedStarters = sortPositions(starterPositions);
    const starters = getStarterSlots(sortedStarters);
    const bench = getBenchSlots(totalNumberOfPlayersAllowed, benchPlayersAllowed, sortedStarters.length);

    return [...starters, ...bench];
};