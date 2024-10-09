"use client";

import {useState} from "react";
import ChatWindow from "@/components/chat/chat-window.jsx";
import ChatInput from "@/components/chat/chat-input.jsx";
import {useSession} from "next-auth/react";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import * as styles from './messages.module.scss';
import {useGetAllMessages} from "@/hooks/draft-tracker/chat-hooks.jsx";

const ChatContainer = () => {
    const [currentMessages, setCurrentMessages] = useState([]);
    const {data: session, status} = useSession();

    // Used for pagination
    const [lastKey, setLastKey] = useState('');

    useGetAllMessages(session, status, setCurrentMessages, lastKey, setLastKey);

    return status === SESSION_CONSTANTS.AUTHENTICATED ? (
        <section className={styles.chat_container}>
            <ChatWindow messages={currentMessages}/>
            <div className={styles.chat_input}>
                <ChatInput/>
            </div>
        </section>
    ) : null;
}

export default ChatContainer;