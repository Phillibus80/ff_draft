"use client";

import {useEffect, useRef} from "react";
import {debounce} from "../../../lib/util/utils";
import {addMessage} from "../../../lib/chat/messages.js";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation.js";
import {ROUTES} from "@/app-constants.js";

const ChatInput = () => {
    const inputRef = useRef();
    const session = useSession();
    const router = useRouter();

    const debouncedSubmit = debounce(async (message, author) => {
        await addMessage(message, author);
    }, 300);

    const handleSubmit = async event => {
        event.preventDefault();
        const message = inputRef.current.value;

        if (message) {
            debouncedSubmit(message, session.data.user.username);

            // Reset the field
            inputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            router.push(ROUTES.HOME);
        }
    }, [session.status, router]);

    switch (session.status) {
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