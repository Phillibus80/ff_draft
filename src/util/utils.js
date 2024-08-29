import {positionOrder} from "../../app-constants.js";

export function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// Roster Utils
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

function sortPositions(positions) {
    const startersArr = Object.entries(positions);

    return positionOrder.map(
        position => startersArr.find(
            ([key]) => position === key
        )
    );
}

export const getRosterSlots = rosterconstruction => {
    const {
        starterPositions,
        totalNumberOfPlayersAllowed,
        benchPlayersAllowed
    } = rosterconstruction;

    const sortedStarters = sortPositions(starterPositions);
    const starters = getStarterSlots(sortedStarters);
    const bench = getBenchSlots(totalNumberOfPlayersAllowed, benchPlayersAllowed, sortedStarters.length);

    return [...starters, ...bench];
};