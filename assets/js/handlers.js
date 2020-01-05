// Handlers

features.sound.onclick = function (tap) {
    console.log("Sound has been turned " + tap);
}

features.lang.onclick = function (tap) {
    console.log("Language has been switched to " + tap);
}

features.timer.timer({
    seconds: 14,
    hours: 2,
    minutes: 6,
});