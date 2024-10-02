'use server';

import {AuthError} from "next-auth";
import {initFirebaseAdmin} from "../../../lib/initFirebaseAdmin.js";
import {signIn} from "../../../lib/auth.js";
import {getAuth} from "firebase-admin/auth";
import {ROUTES} from "@/app-constants.js";
import {getUser} from "../../../lib/league/getUser.js";
import {stripStr} from "../../../lib/util/utils.js";

// Initialize Firebase Admin
initFirebaseAdmin();

export async function getCustomToken(username) {
    const lowercaseUsername = stripStr(username);
    const user = await getUser(lowercaseUsername);
    if (!user || !user.USERNAME) throw new AuthError('Please create an account.');

    return await getAuth().createCustomToken(user.USERNAME, {});
}

export async function authenticate(username, password) {
    try {
        const loginInfo = {username, password};

        const customFBToken = await getCustomToken(username);

        // Next Auth sign in, creates JWT and Session
        await signIn('credentials', {
            ...loginInfo,
            redirectTo: ROUTES.DRAFT_ROOM,
            customToken: customFBToken
        });

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials';
                default:
                    return 'Something went wrong';
            }
        }
        throw error;
    }
}
