import {initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";

const inDevelopment = true;

const firebasePRODConfig = {
    apiKey: '<your-api-key>',
    authDomain: '<your-auth-domain>',
    databaseURL: '',
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
