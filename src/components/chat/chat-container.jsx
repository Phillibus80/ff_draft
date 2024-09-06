"use client";

import {useEffect, useState} from "react";
import {getAllMessages} from "../../../lib/chat/messages.js";
import ChatWindow from "@/components/chat/chat-window.jsx";
import ChatInput from "@/components/chat/chat-input.jsx";
import SessionWrapper from "@/components/session-wrapper/session-wrapper.jsx";

const ChatContainer = () => {
    const [currentMessages, setCurrentMessages] = useState([]);

    // Used for pagination
    const [lastKey, setLastKey] = useState('');

    useEffect(() => {
        getAllMessages(setCurrentMessages, lastKey, setLastKey);

    }, []);

    return (
        <>
            <ChatWindow messages={currentMessages}/>

            <SessionWrapper>
                <ChatInput/>
            </SessionWrapper>
        </>
    );
}

export default ChatContainer;