import styles from "./page.module.scss";
import PlayerList from "@/components/player-list/player-list.jsx";
import Chat from "@/components/chat/chat.jsx";
import Roster from "@/components/roster/roster.jsx";

export default function DraftRoom() {
    return (
        <main className={styles.main}>
            <Roster/>
            <PlayerList/>
            <Chat/>
        </main>
    );
}
