"use client";

import {useEffect, useRef} from "react";
import {debounce} from "../../../lib/util/utils";
import {addMessage} from "../../../lib/chat/messages.js";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation.js";
import {ROUTES} from "@/app-constants.js";

const ChatInput = () => {
    const inputRef = useRef();
    const {data: session, status} = useSession();
    const router = useRouter();

    // TODO make this dynamic
    const currentLeague = 'da_league';
    const sessionLeague = !!session?.user?.leagues[currentLeague]
        ? currentLeague
        : '';

    const debouncedSubmit = debounce(async (message, author, leagueName) => {
        await addMessage(message, author, leagueName);
    }, 300);

    const handleSubmit = async event => {
        event.preventDefault();
        const message = inputRef.current.value;

        if (message) {
            debouncedSubmit(message, session.user.username, sessionLeague);

            // Reset the field
            inputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(ROUTES.HOME);
        }
    }, [status, router]);

    switch (status) {
        case "loading":
            return (
                <div>Loading...</div>
            );
        case 'authenticated':
            return (
                <form id='form' onSubmit={handleSubmit} action=''>
                    <input ref={inputRef} autoComplete='off'/>
                    <button>Send</button>
                </form>
            );
        default:
            return null;
    }
};

export default ChatInput;