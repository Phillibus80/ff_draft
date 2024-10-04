/**
 * @typedef {import('../../../lib/jsdoc/types.js').SessionAuthStatus} SessionAuthStatus
 */

import {useEffect} from "react";
import {signInWithCustomToken} from "firebase/auth";
import {auth} from "../../lib/firebaseConfig.js";
import {ROUTES, SESSION_CONSTANTS} from "@/app-constants.js";
import {useRouter} from "next/navigation.js";

/**
 * A client side call to the firebase realtime database to authenticate after the user has logged into the application.
 *
 * @param {string} customToken - the custom token generated by the server that is returned to the client
 */
export const useFirebaseSignInWithCustomToken = customToken => {
    useEffect(() => {
        if (customToken) {
            signInWithCustomToken(auth, customToken).then(() => {
            });
        }

    }, [customToken]);
}

/**
 * A hook that checks the session status and if the session is expired or unauthenticated,
 * the user is re-routed to the home/login page.
 *
 * @param {SessionAuthStatus} status - the authentication status of the session cookie
 */
export const useRerouteIfUnauthenticated = status => {
    const router = useRouter();

    useEffect(() => {
        switch (status) {
            case SESSION_CONSTANTS.UNAUTHENTICATED:
                router.push(ROUTES.HOME);
        }
    }, [status]);
}