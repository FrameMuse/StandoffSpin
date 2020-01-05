// Extending Functions

String.prototype.split = function() {
    var output = [],
        string = this.toString(),
        length = string.length;

    for (var i = 0; i < length; i++) {
        output.push(+string.charAt(i));
    }

    return output;
}

// Jquery

$.fn.extend({
    toggleText: function (a, b = null) {
        return this.html(this.html() == b ? a : b);
    },
    split: function () {
        var output = [],
            string = this.text().toString(),
            length = string.length;

        for (var i = 0; i < length; i++) {
            output.push(+string.charAt(i));
        }

        return output;
    },
});

// Events



// Classes

class features_lang {
    constructor() {
        this.tap = "rus"; // Default "ru"
        this.onclick = function () { };
        this.path = "/assets/img/icons/";
        const $this = this;

        $(".js-option-lang").click(() => {
            var tap = this.toggleTap("rus", "eng");
            $(".topbar-language__icon").css({ "background-image": this.path + tap });
            $(".topbar-language__text").html(tap);
            this.onclick(tap);
        });
    }
    toggleTap(a, b = null) {
        return this.tap = (this.tap == b ? a : b);
    }
}

class features_sound {
    constructor() {
        this.tap = "on"; // Default "on"
        this.onclick = function () { };
        const $this = this;

        $(".js-option-volume").click(function () {
            $(this)
                .find(".stndfspin-features__icon")
                .toggleClass("stndfspin-button--unfilled")
                .toggleClass("stndfspin-features__icon--green")
                .parent().find(".stndfspin-features__column > span")
                .toggleText("Вкл.", "Выкл.");
            $this.onclick($this.toggleTap("on", "off"));
        });
    }

    toggleTap(a, b = null) {
        return this.tap = (this.tap == b ? a : b);
    }
}

class features_timer {
    constructor() {
        this.data = {
            numbers: {
                seconds: 0,
                minutes: 0,
                hours: 0,
            },
        };
    }

    counts(data = "") {
        return $(".timer-v2__count[data-count='" + data + "']").find("span");
    }

    async timer(numbers = {}, speedup = 1) {
        this.data.numbers = numbers;
        return await new Promise(resolve => {
            var interval = setInterval(() => {
                    // Calculating
                    if (this.single_discount("seconds", 59))
                        if (this.single_discount("minutes", 59)) 
                            if (this.single_discount("hours", 24)) {
                                clearInterval(interval);
                                resolve();
                                return;
                            }
                    
                    // Commiting changes in HTML
                    for (const property in numbers) {
                        this.counts(property).each(function (i) {
                            $(this).html(split(numbers[property], 2)[i]);
                        });
                    }
                }, 1000 / speedup);
        });
    }

    single_discount($var = "", Default = 0) {
        if (this.data["numbers"][$var] == undefined) return true;
        if (this.data["numbers"][$var] <= 0) {
            this.data["numbers"][$var] = Default;
            return true;
        } else this.data["numbers"][$var]--;
    }
}

const features = new class {
    constructor() {
        this.sound = new features_sound();
        this.lang = new features_lang();
        this.timer = new features_timer();
    }
}

// Functions

function split(number = 0, bandwidth = 0) {
    var string = number.toString(),
        length = string.length,
        bandwidth = length >= bandwidth ? 0 : bandwidth - length,
        output = new Array(bandwidth).fill(0);

    for (var i = 0; i < length; i++) {
        output.push(+string.charAt(i));
    }

    return output;
}