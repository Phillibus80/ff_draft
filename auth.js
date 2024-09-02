import NextAuth from "next-auth";
import {authConfig} from "./auth.config.js";
import Credentials from 'next-auth/providers/credentials';
import {z} from 'zod';
import {getUser} from "./lib/league/getUser.js";
import bcrypt from "bcrypt";

export const {session, signIn, signOut} = NextAuth({
    ...authConfig,
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
    session: {
        strategy: 'jwt'
    },
    secret: process.env.AUTH_SECRET
});