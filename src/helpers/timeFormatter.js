export const youTubeTimeToSeconds = (youTubeTime) => {
    var regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    var hours = 0,
        minutes = 0,
        seconds = 0,
        totalseconds;

    if (regex.test(youTubeTime)) {
        var matches = regex.exec(youTubeTime);
        if (matches[1]) hours = Number(matches[1]);
        if (matches[2]) minutes = Number(matches[2]);
        if (matches[3]) seconds = Number(matches[3]);
        totalseconds = hours * 3600 + minutes * 60 + seconds;
    }
    return totalseconds;
};

export function millisecondsToMinutesAndSeconds(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.round((milliseconds % 60000) / 1000);
    return {
        minutes,
        seconds
    };
}

export function millisecondsToReadableTime(milliseconds) {
    const { minutes, seconds } = millisecondsToMinutesAndSeconds(milliseconds);
    const minuteLabel = minutes === 1 ? "minute" : "minutes";
    const secondLabel = seconds === 1 ? "second" : "seconds";
    if (minutes > 0 && seconds > 0) {
        return `${minutes} ${minuteLabel} and ${seconds} ${secondLabel}`;
    } else if (minutes > 0) {
        return `${minutes} ${minuteLabel}`;
    } else {
        return `${seconds} ${secondLabel}`;
    }
}
