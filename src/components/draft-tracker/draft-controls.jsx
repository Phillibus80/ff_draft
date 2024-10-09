import styles from "@/components/draft-tracker/draft-tracker.module.scss";

const DraftControls = (
    {
        timeAllowed,
        resetTimer,
        resumeTimer,
        pauseTimer,
        setRemainingTime,
        remainingTime
    }
) => {
    return (
        <div className={styles.button_group}>
            <button onClick={() =>
                Promise.all([resetTimer(), resumeTimer()])}
            >
                Start Draft
            </button>

            <button onClick={pauseTimer}>
                Pause Draft
            </button>

            <button onClick={() => resumeTimer(remainingTime)}>
                Resume Draft
            </button>

            <button onClick={() => {
                resetTimer();
                setRemainingTime(timeAllowed);
            }}
            >
                Reset Draft
            </button>
        </div>
    )
};

export default DraftControls;