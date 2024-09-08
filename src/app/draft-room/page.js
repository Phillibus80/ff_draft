import styles from "./page.module.scss";
import PlayerList from "@/components/player-list/player-list.jsx";
import RosterContainer from "@/components/roster/rosterContainer.jsx";
import ChatContainer from "@/components/chat/chat-container.jsx";
import SessionWrapper from "@/components/session-wrapper/session-wrapper.jsx";

export default function DraftRoom() {
    return (
        <main className={styles.main}>
            <SessionWrapper>
                <RosterContainer/>
                <PlayerList/>
                <ChatContainer/>
            </SessionWrapper>
        </main>
    );
}
