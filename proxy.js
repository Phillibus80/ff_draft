import NextAuth from 'next-auth';
import {authOptions} from "./lib/auth.js";

export default NextAuth(authOptions).auth;

export const config = {
    // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
    matcher: ['/((?!api|socket-test|_next/static|_next/image|.*\\.png$).*)'],
};