"use client";

import {useEffect, useState} from "react";
import {getAllMessages} from "../../../lib/chat/messages.js";
import ChatWindow from "@/components/chat/chat-window.jsx";
import ChatInput from "@/components/chat/chat-input.jsx";

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
            <ChatInput/>
        </>
    );
}

export default ChatContainer;