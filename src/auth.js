import NextAuth from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import {z} from 'zod';
import {getUser} from "../lib/league/getUser.js";
import bcrypt from "bcrypt";

export const authOptions = {
    providers: [
        Credentials({
            name: 'Login form credentials',
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({username: z.string().min(8), password: z.string().min(4)})
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const {username, password} = parsedCredentials.data;
                    const lowercaseUsername = username.toLowerCase();
                    const user = await getUser(lowercaseUsername);

                    if (!user) return null;
                    const passwordMatch = await bcrypt.compare(password, user.PASSWORD);

                    if (passwordMatch) return user;
                }

                return null;
            },
        }),
    ],
    callbacks: {
        // TODO encrypt the personal info
        async session({session, token}) {
            session.user.id = token.id;
            session.user.username = token.username;
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.team = token.team;
            session.user.leagues = token.leagues;

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
                token.leagues = user.LEAGUES;

                // TODO remove this
                token.players = user.PLAYERS;
            }
            return token;
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
