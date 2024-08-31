import NextAuth from "next-auth";
import {authConfig} from "./auth.config.js";
import Credentials from 'next-auth/providers/credentials';
import {z} from 'zod';
import {getUser} from "../lib/league/getUser.js";
import bcrypt from "bcrypt";

export const {auth, signIn, signOut} = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({username: z.string().min(8), password: z.string().min(2)})
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const {username, password} = parsedCredentials.data;
                    const lowercaseUsername = username.toLowerCase();
                    const user = await getUser(lowercaseUsername);

                    if (!user) return null;
                    const passwordMatch = await bcrypt.compare(password, user.PASSWORD);

                    if (passwordMatch) {
                        // revalidatePath(ROUTES.DRAFT_ROOM, 'layout');
                        // redirect(ROUTES.DRAFT_ROOM);

                        return ({message: 'Successfully signed in.', payload: user});
                    }
                }

                return null;
            },
        }),
    ],
});