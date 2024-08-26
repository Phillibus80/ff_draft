"use client";

import {useEffect, useRef, useState} from "react";
import ChatWindow from "@/components/chat/chat-window";
import {debounce} from "@/util/utils";
import {addMessage, getAllMessages} from "../../../lib/chat/messages.js";
import {closeDatabaseConnection} from "../../../lib/firebaseConfig.js";

const Chat = () => {
    const inputRef = useRef();
    const [currentMessages, setCurrentMessages] = useState([]);

    useEffect(() => {
        getAllMessages(setCurrentMessages);

       // return () => closeDatabaseConnection();
    }, []);

    const debouncedSubmit = debounce(async (message, author = 'Phillibus') => {
        await addMessage(message, author);
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
            <ChatWindow messages={currentMessages}/>
            <form id='form' onSubmit={handleSubmit} action=''>
                <input ref={inputRef} autoComplete='off'/>
                <button>Send</button>
            </form>
        </>
    );
};

export default Chat;