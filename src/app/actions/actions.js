'use server';

import {AuthError} from "next-auth";
import {ROUTES} from "@/app-constants.js";
import {revalidatePath} from "next/cache.js";
import {redirect} from "next/navigation.js";
import {signIn} from "@/auth.js";

export async function authenticate(prevState, formValues) {
    try {
        const loginInfo = {
            username: formValues.get('username'),
            password: formValues.get('password')
        };

        const res = await signIn('credentials', {
            ...loginInfo,
            redirect: false,
            redirectTo: ROUTES.DRAFT_ROOM
        });

        console.log('Sign In Res:: ', res);

        revalidatePath(res, 'page');
        redirect(res);

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