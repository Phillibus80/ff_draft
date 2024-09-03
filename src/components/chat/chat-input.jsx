"use client";

import {useRef} from "react";
import {debounce} from "../../../lib/util/utils";
import {addMessage} from "../../../lib/chat/messages.js";
import {useSession} from "next-auth/react";

const ChatInput = () => {
    const inputRef = useRef();
    const session = useSession();
    console.log('Session:: ', session);

    const debouncedSubmit = debounce(async (message, author = 'Phillibus') => {
        await addMessage(message, author);
    }, 300);

    const handleSubmit = async event => {
        event.preventDefault();
        const message = inputRef.current.value;

        if (message) {
            debouncedSubmit(message);

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