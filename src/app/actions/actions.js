'use server';

import {AuthError} from "next-auth";
import {ROUTES} from "@/app-constants.js";
import {signIn} from "@/auth.js";

export async function authenticate(prevState, formValues) {
    try {
        const loginInfo = {
            username: formValues.get('username'),
            password: formValues.get('password')
        };

        await signIn('credentials', {
            ...loginInfo,
            redirectTo: ROUTES.DRAFT_ROOM
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