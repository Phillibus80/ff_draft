import {ref, set} from "firebase/database";
import data_23 from './mock-data/2023.json' assert {type: 'json'};
import data_22 from './mock-data/2022.json' assert {type: 'json'};
import users from './mock-data/user-mock.json' assert {type: 'json'};
import messages from './mock-data/message-mock.json' assert {type: 'json'};
import leagues from './mock-data/league-mock.json' assert {type: 'json'};
import leagueRules from './mock-data/league-rules-mock.json' assert {type: 'json'};

import {closeDatabaseConnection, database as db} from "../lib/firebaseConfig.js";
import {convertToFirebaseJsonFormat, getDBPath, getDBTypeReadable} from "./data-utils.js";
import {PREVIOUS_YEAR} from "../app-constants.js";

// Mock Data
const seasonStats23 = convertToFirebaseJsonFormat(data_23);
const seasonStats22 = convertToFirebaseJsonFormat(data_22);
const userMock = convertToFirebaseJsonFormat(users, 'USERNAME');
const messageMock = convertToFirebaseJsonFormat(messages, 'TIMESTAMP');
const leagueMock = convertToFirebaseJsonFormat(leagues, 'NAME');
const leagueRulesMock = convertToFirebaseJsonFormat(leagueRules, 'NAME');

const dbTypeEnum = ['stats', 'users', 'messages', 'leagues', 'rules'];

async function seedDataToDB(jsonData, dbType, seasonYear = PREVIOUS_YEAR) {
    const isHandleDBType = dbTypeEnum.some(dbEnum => dbEnum === dbType);
    if (!isHandleDBType) return console.error('Incorrect dbType: stats, users, messages, leagues')

    const data = JSON.parse(jsonData);
    const dataArr = Object.entries(data);

    try {
        for (const [key, dataObj] of dataArr) {
            const dbPath = getDBPath(dbType, key, seasonYear);
            const newObjectRef = ref(db, dbPath);
            await set(newObjectRef, dataObj);
        }

        const dbTypeReadable = getDBTypeReadable(dbType);
        console.log(`${dbTypeReadable} successfully seeded to the database.`);
    } catch (e) {
        console.error('Error seeding the database:: ', e);
    }
}

const seedingPromises = async () => Promise.all([
    seedDataToDB(seasonStats23, 'stats'),
    seedDataToDB(seasonStats22, 'stats', 2022),
    seedDataToDB(userMock, 'users'),
    seedDataToDB(messageMock, 'messages'),
    seedDataToDB(leagueMock, 'leagues'),
    seedDataToDB(leagueRulesMock, 'rules')
]);

seedingPromises()
    .then(() => {
        console.log('Database successfully seeded.');
        closeDatabaseConnection();
    })
    .catch(() => {
        console.error('Failed to successfully seed the database.');
        closeDatabaseConnection();
    });