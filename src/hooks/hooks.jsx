import {useEffect} from "react";
import {signInWithCustomToken} from "firebase/auth";
import {auth} from "../../lib/firebaseConfig.js";
import {ROUTES, SESSION_CONSTANTS} from "@/app-constants.js";
import {useRouter} from "next/navigation.js";

export const useFirebaseSignInWithCustomToken = customToken => {
    useEffect(() => {
        if (customToken) {
            signInWithCustomToken(auth, customToken)
                .then(res => console.log('Sign Custom Token:: ', res));
        }

    }, [customToken]);
}

export const useRerouteIfUnauthenticated = status => {
    const router = useRouter();

    useEffect(() => {
        switch (status) {
            case SESSION_CONSTANTS.UNAUTHENTICATED:
                router.push(ROUTES.HOME);
        }
    }, [status]);
}