import {useEffect} from "react";

export const useCountDown = (isRunning, setRemainingTime, timeAllowed, currentTime) => {
    useEffect(() => {
        if (!isRunning) return;

        const timerInterval = setInterval(() => {
            setRemainingTime(prevTime => {
                const newTime = prevTime - 1000;

                if (newTime <= 0) {
                    return Number(timeAllowed);
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [currentTime, isRunning]);
}

export const useUpdateTimerText = (remainingTime, setCountDownText) => {
    const date = new Date(remainingTime);

    useEffect(() => {
        const min = date.getMinutes();
        const sec = date.getSeconds();

        setCountDownText(`${min}:${sec < 10 ? '0' : ''}${sec}`);
    }, [remainingTime]);
}