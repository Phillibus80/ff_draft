"use client";

import {useRef} from "react";
import ChatWindow from "@/api/chat/chat-window";
import socket from "@/components/socket/socket";
import {debounce} from "@/util/utils";

const Chat = () => {
    const inputRef = useRef();

    const debouncedSubmit = debounce(message => {
       socket.emit('add message', {
          message: message,
          author: 'Phillibus'
       });
    }, 300);

    const handleSubmit = async event => {
        event.preventDefault();
        const message = inputRef.current.value;

        if (message) {
            // Send the signal to update the database
            debouncedSubmit(message);

            // Reset the field
            inputRef.current.value = '';
        }
    };

    return (
        <>
            <ChatWindow />
            <form id='form' onSubmit={handleSubmit} action=''>
                <input ref={inputRef} autoComplete='off'/>
                <button>Send</button>
            </form>
        </>
    );
};

export default Chat;