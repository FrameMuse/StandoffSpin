# Документация по StandoffSpin

Автор настоятельно сука рекомендует создать собственный файл например handlers.js и писать там всё что душе угодится.

## Оглавление

- [Minor Functionalities](#Minor-Functionalities)
	- [Language](#Language--Sound)
	- [Sound](#Language--Sound)

- [Timer](#Timer)
	- [Begin or start](#Initiate)
	- [Get a promise](#Promises)
	
- [Wheel](#Wheel)
	- [Choose a winner](#Choosing-a-winner)
	- [Restart or reopen](#Restart-or-reopen)
	- [Get a promise](#Promises)
	
## Minor Functionalities

### Language & Sound

These functions already have their own pre-built JS events. You can use onclick functions which start together with scripts in order to do extra actions. Usage of them is simple enough and it's here:

```JS

features.sound.onclick = function (tap) {
    console.log("Sound has been turned " + tap);
}

features.lang.onclick = function (tap) {
    console.log("Language has been switched to " + tap);
}

```

## Timer

### Initiate

The timer is initiated by Initiate() function. It handles 3 possible arguments to be passed: seconds, minutes, hours.

```JS

features.timer.initiate({
    seconds: 14,
    hours: 2,
    minutes: 6, 
});

```

## Wheel

### Init

Before you can start using the wheel it's needed to be intiated via init() function like that:

```JS

features.wheel.init();

```

### Choosing a winner

To "choose a winner" function win() definitely helps you. It will be spinning to certain id and for your additional convenience it will change the data at the proper moment.

```JS

features.wheel.win({
    id: 14,
    skin: {
        image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
        title: "Skin бомжа",
    },
});

```

### Restart or reopen

Yeah you can reload wheel like for Sound or Language

```JS

features.wheel.reopen.onclick = function () {
    console.log("The wheel has been reopenned");
}

```

### Promises

You also can get promises to handle somehow else

```JS

console.log("Timer", features.timer.promise);
console.log("Wheel", features.wheel.promise);

```
