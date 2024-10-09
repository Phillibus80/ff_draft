import NextAuth from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import {z} from 'zod';
import {getUser} from "./league/getUser.js";
import bcrypt from "bcrypt";
import {stripStr} from "./util/utils.js";

export const authOptions = {
    providers: [
        Credentials({
            name: 'Login form credentials',
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({
                        username: z.string().min(8),
                        password: z.string().min(4),
                        customToken: z.string().min(56)
                    })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const {
                        username,
                        password,
                        customToken
                    } = parsedCredentials.data;
                    const lowercaseUsername = stripStr(username);
                    const user = await getUser(lowercaseUsername);

                    if (!user) return null;
                    const passwordMatch = await bcrypt.compare(password, user.PASSWORD);

                    if (passwordMatch) {
                        return ({
                            user: user,
                            customToken: customToken
                        });
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        /**
         * A middleware function to create the jwt.
         *
         * @param {UserSessionObject} token - the session cookie
         * @param {GetUserResponse} userResponse - the user response from the getUser call
         * @return {Promise<UserSessionObject>} - the jwt token
         */
        async jwt({token, user: userResponse}) {
            if (userResponse?.user && userResponse?.customToken) {
                const {user: userChild, customToken} = userResponse;

                token.uid = userChild.USERNAME;
                token.username = userChild.USERNAME;
                token.name = userChild.NAME;
                token.email = userChild.EMAIL;
                token.team = userChild.TEAM_NAME;
                token.leagues = userChild.LEAGUES;
                token.customToken = customToken;
            }

            return token;
        },
        /**
         * A middle ware function to set the session cookie.
         *
         * @param {DraftSession} session - the session cookie
         * @param {UserSessionObject} token - the jwt token.
         * @return {Promise<DraftSession>} - the set session cookie
         */
        async session({session, token}) {
            session.user.uid = token.uid;
            session.user.username = token.username;
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.team = token.team;
            session.user.leagues = token.leagues;
            session.user.customToken = token.customToken;

            return session;
        },
        authorized({auth, request: {nextUrl}}) {
            const date = new Date();
            const isTokenExpired = date.getTime() >= Date.parse(auth?.expires);

            return !!auth?.user?.id && !isTokenExpired;
        }
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.AUTH_SECRET
};

export const {
    handlers: {GET, POST},
    auth,
    signIn,
    signOut
} = NextAuth(authOptions);
