import {initializeApp} from "firebase/app";
import {getDatabase, goOffline} from "firebase/database";

const inDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const firebasePRODConfig = {
    apiKey: '<your-api-key>',
    authDomain: '<your-auth-domain>',
    databaseURL: 'https://fantasy-football-draft-8c8be-default-rtdb.firebaseio.com',
    projectId: '<your-project-id>',
    storageBucket: '<your-storage-bucket>',
    messagingSenderId: '<your-messaging-sender-id>',
    appId: '<your-app-id>'
};

const firebaseDEVConfig = {
    databaseURL: 'http://localhost:9000?ns=fantasy-football-draft'
};

const firebaseConfig = inDevelopment ? firebaseDEVConfig : firebasePRODConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const database = getDatabase(app);

// Close Firebase
export const closeDatabaseConnection = () => goOffline(database);
