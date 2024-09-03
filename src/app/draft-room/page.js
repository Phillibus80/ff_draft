import styles from "./page.module.scss";
import PlayerList from "@/components/player-list/player-list.jsx";
import Roster from "@/components/roster/roster.jsx";
import ChatContainer from "@/components/chat/chat-container.jsx";

export default function DraftRoom() {
    return (
        <main className={styles.main}>
            <Roster/>
            <PlayerList/>
            <ChatContainer/>
        </main>
    );
}
