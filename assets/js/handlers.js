// Handlers

// Minor Functions

features.sound.onclick = function (tap) {
    console.log("Sound has been turned " + tap);
}

features.lang.onclick = function (tap) {
    console.log("Language has been switched to " + tap);
}

// Timer

features.timer.initiate({
    seconds: 14,
    hours: 2,
    minutes: 6, 
});

console.log("Timer", features.timer.promise);

// Wheel

features.wheel.win({
    id: 14,
    skin: {
        image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
        title: "Skin бомжа",
    },
});

console.log("Wheel", features.wheel.promise);

features.wheel.reopen.onclick = function () {
    console.log("The wheel has been reopenned");
}