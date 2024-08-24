import {ref, set} from "firebase/database";
import data_23 from './2023.json' assert {type: 'json'};
import data_22 from './2022.json' assert {type: 'json'};

import {database as db} from "../lib/firebaseConfig.js";
import {convertToFirebaseJsonFormat} from "./data-utils.js";

const seasonStats23 = convertToFirebaseJsonFormat(data_23);
const seasonStats22 = convertToFirebaseJsonFormat(data_22);

async function seedPlayers(jsonData, seasonYear) {
    const data = JSON.parse(jsonData);
    const dataArr = Object.entries(data);

    try {
        for (const [playerKey, player] of dataArr) {
            const newPlayerRef = ref(db, `players_stats_${seasonYear}/${playerKey}`);
            await set(newPlayerRef, player);
        }

        console.log('Database successfully seeded.');
    } catch (e) {
        console.error('Error seeding the database:: ', e);
    }
}

seedPlayers(seasonStats23, 2023);
seedPlayers(seasonStats22, 2022);
