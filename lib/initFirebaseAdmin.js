"use server";

import admin from 'firebase-admin';

export const initFirebaseAdmin = async () => {
    if (!admin.apps.length) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        // Initialize the Firebase Admin SDK
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
};
