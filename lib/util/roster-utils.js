export const getRosterSlots = rosterConstruction => {
    const {
        starterPositions,
        totalNumberOfPlayersAllowed
    } = rosterConstruction;

    // Starter Positions
    const rosterMap = Object.entries(starterPositions)
        .reduce((accum, [currentKey, currentValue]) => {
            for (let n = 0; n < currentValue; n++) {
                accum[`${currentKey}_${n}`] = ''
            }

            return accum;
        }, {});

    // Bench Positions
    const numOfStarterPositions = Object.entries(starterPositions)?.length;
    const numberOfBenchSpots = totalNumberOfPlayersAllowed - numOfStarterPositions;
    for (let n = 0; n < numberOfBenchSpots; n++) {
        rosterMap[`BENCH_${n}`] = '';
    }

    return rosterMap;
};