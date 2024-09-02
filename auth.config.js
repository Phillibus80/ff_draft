import {ROUTES} from "./app-constants.js";

export const authConfig = {
    page: {
        signIn: ROUTES.HOME
    },
    callbacks: {
        // TODO encrypt the personal info
        async session({session, token}) {
            session.user.id = token.id;
            session.user.username = token.username;
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.team = token.team;
            return session;
        },
        // TODO encrypt the personal info
        async jwt({token, user}) {
            if (user) {
                token.id = user.id;
                token.username = user.USERNAME;
                token.name = user.NAME;
                token.email = user.EMAIL;
                token.team = user.TEAM_NAME;
            }
            return token;
        },
        authorized({auth, request: {nextUrl}}) {
            const date = new Date();
            const isTokenExpired = date.getTime() >= Date.parse(auth?.expires);
            const isLoggedIn = !!auth?.user?.id && !isTokenExpired;
            const isInDraftRoom = nextUrl.pathname.startsWith(ROUTES.DRAFT_ROOM);

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