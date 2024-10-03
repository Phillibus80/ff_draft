"use client";

import {useEffect, useState} from "react";
import {getAllMessages} from "../../../lib/chat/messages.js";
import ChatWindow from "@/components/chat/chat-window.jsx";
import ChatInput from "@/components/chat/chat-input.jsx";
import {useSession} from "next-auth/react";
import {getLeagueFromSession} from "../../../lib/util/utils.js";
import {SESSION_CONSTANTS} from "@/app-constants.js";
import * as styles from './messages.module.scss';

const ChatContainer = () => {
    const [currentMessages, setCurrentMessages] = useState([]);
    const {data: session, status} = useSession();

    // Used for pagination
    const [lastKey, setLastKey] = useState('');

    useEffect(() => {
        let unsubscribe;

        switch (status) {
            case SESSION_CONSTANTS.AUTHENTICATED:
                const sessionLeague = getLeagueFromSession(session, status);
                unsubscribe = getAllMessages(sessionLeague, setCurrentMessages, lastKey, setLastKey);

                break;
        }

        return () => unsubscribe && unsubscribe();

    }, [status]);

    return status === SESSION_CONSTANTS.LOADING
        ? <div>Loading...</div>
        : (
            <section className={styles.chat_container}>
                <ChatWindow messages={currentMessages}/>
                <div className={styles.chat_input}>
                    <ChatInput/>
                </div>
            </section>
        );
}

export default ChatContainer;