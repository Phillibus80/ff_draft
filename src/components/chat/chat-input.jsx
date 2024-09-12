"use client";

import {useRef} from "react";
import {debounce, getLeagueFromSession} from "../../../lib/util/utils";
import {addMessage} from "../../../lib/chat/messages.js";
import {useSession} from "next-auth/react";

const ChatInput = () => {
    const inputRef = useRef();
    const {data: session, status} = useSession();
    const sessionLeague = getLeagueFromSession(session, status);

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

    return (
        <form id='form' onSubmit={handleSubmit} action=''>
            <input ref={inputRef} autoComplete='off'/>
            <button>Send</button>
        </form>
    );
};

export default ChatInput;