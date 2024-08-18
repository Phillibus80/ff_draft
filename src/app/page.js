import styles from "./page.module.scss";
import PlayerList from "@/components/player-list/player-list";

export default function Home() {
  return (
    <main className={styles.main}>
      <PlayerList />
    </main>
  );
}
