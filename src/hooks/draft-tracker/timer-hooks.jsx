import {useEffect} from "react";
import {msToMinSec} from "../../../lib/util/utils.js";

/**
 * A hook used to create a countdown timer.  It starts at the timeAllowed and counts down every second.
 *
 * @param {boolean} isRunning - a flag to indicate if the timer is running
 * @param {function} setRemainingTime - setState callback to update the remaining time on the global timer
 * @param {number} timeAllowed - total time in ms to draft or trade a player
 * @param {number} currentTime - the current time in ms
 */
export const useCountDown = (isRunning, setRemainingTime, timeAllowed, currentTime) => {
    useEffect(() => {
        if (!isRunning) return;

        const timerInterval = setInterval(() => {
            setRemainingTime(prevTime => {
                const newTime = prevTime - 1000;

                if (newTime === 0) {
                    return Number(timeAllowed);
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [currentTime, isRunning]);
}

/**
 * A hook used to create the text for a countdown timer.
 *
 * @param {number} timeAllowed - total time in ms for the user to either trade or draft a player
 * @param {number} remainingTime - the remaining time in ms to either trade or draft a player
 * @param {function} setCountDownText - setState callback with the timer text
 */
export const useUpdateTimerText = (timeAllowed, remainingTime, setCountDownText) => {
    const date = new Date(remainingTime);
    const dateTimeAllowed = msToMinSec(timeAllowed);

    useEffect(() => {
        const min = date.getMinutes();
        const sec = date.getSeconds();

        const result = min === 0 && sec === 0
            ? dateTimeAllowed
            : `${min}:${sec < 10 ? '0' : ''}${sec}`;

        setCountDownText(result);
    }, [remainingTime]);
}