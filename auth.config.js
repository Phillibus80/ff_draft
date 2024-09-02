import {ROUTES} from "./app-constants.js";

export const authConfig = {
    page: {
        signIn: ROUTES.HOME
    },
    callbacks: {
        authorized({auth, request: {nextUrl}}) {
            const isLoggedIn = !!auth?.user;
            const isInDraftRoom = nextUrl.pathname.startsWith(ROUTES.DRAFT_ROOM);

            console.log('In draft room:: ', auth);
            if (isInDraftRoom) {
                return isLoggedIn;
            } else if (isLoggedIn) {
                return Response.redirect(new URL(ROUTES.DRAFT_ROOM, nextUrl));
            }

            return true;
        }
    },
    providers: []
}