'use server';

import {signIn} from "@/auth.js";
import {AuthError} from "next-auth";

export async function authenticate(prevState, formValues) {
    try {
        const loginInfo = {
            username: formValues.get('username'),
            password: formValues.get('password')
        };

        await signIn('credentials', loginInfo);
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