import {getApps, initializeApp} from "firebase/app";
import {getDatabase, goOffline} from "firebase/database";
import {connectAuthEmulator, getAuth} from "firebase/auth";

const inDevelopment = process.env.NODE_ENV === 'development';

const firebasePRODConfig = {
    apiKey: "AIzaSyC-kJ_OWTuax5fEEsQkwyFqMc3tb0fPhIE",
    authDomain: "fantasy-football-draft-8c8be.firebaseapp.com",
    databaseURL: "https://fantasy-football-draft-8c8be-default-rtdb.firebaseio.com",
    projectId: "fantasy-football-draft-8c8be",
    storageBucket: "fantasy-football-draft-8c8be.appspot.com",
    messagingSenderId: "20761116795",
    appId: "1:20761116795:web:38f6b4b13a73a1060c22de",
    measurementId: "G-J6MEY1N38K"
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

const auth = getAuth();
if (inDevelopment) {
    connectAuthEmulator(auth, "http://localhost:9099");
}

export {auth};

// Get a reference to the database service
export const database = getDatabase(app);

// Close Firebase
export const closeDatabaseConnection = () => goOffline(database);
