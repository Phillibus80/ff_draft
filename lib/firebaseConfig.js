import {getApps, initializeApp} from "firebase/app";
import {getDatabase, goOffline} from "firebase/database";
import {connectAuthEmulator, getAuth} from "firebase/auth";

const inDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const firebasePRODConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const firebaseDEVConfig = {
    apiKey: 'FFffFfF-fF_FFFfff5fFFfFfffFfFf3ffifffFF',
    authDomain: 'localhost',
    databaseURL: 'http://localhost:9000?ns=fantasy-football-draft',
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const firebaseConfig = inDevelopment ? firebaseDEVConfig : firebasePRODConfig;

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
if (inDevelopment) {
    connectAuthEmulator(auth, "http://localhost:9099");
}

export {auth};

// Get a reference to the database service
export const database = getDatabase(app);

// Close Firebase
export const closeDatabaseConnection = () => goOffline(database);
