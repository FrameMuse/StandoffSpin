// Extending Functions

String.prototype.num_split = function() {
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
    num_split: function () {
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

$(".faq__summary").click(function () {
    $(this).parent().toggleClass("faq__clause--deployed");
});

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

    async initiate(numbers = {}, speedup = 1) {
        this.data.numbers = numbers;
        this.promise = new Promise(resolve => {
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
                            $(this).html(num_split(numbers[property], 2)[i]);
                        });
                    }
                }, 1000 / speedup);
        });
        
        return await this.promise;
    }

    single_discount($var = "", Default = 0) {
        if (this.data["numbers"][$var] == undefined) return true;
        if (this.data["numbers"][$var] <= 0) {
            this.data["numbers"][$var] = Default;
            return true;
        } else this.data["numbers"][$var]--;
    }
}

class features_wheel {
    constructor() {
        var points = {};
        $(".fortune__circle > *").each(function (i, e) {
            points[i] = $(e);
        });
        this.reopen = {
            onclick: function () { },
        };
        this.data = {
            points,
            spins: 4, // Кол-во оборотов перед тем как дойдёт до нужного блока
            animation: $(".fortune__circle").css("transition"),
            duration: 14,
        };
        this.count(18);

        $(".js-wheel-reopen").click(() => {
            $(".fortune__circle, .fortune-wheel__inner, .fortune-wheel__curve-1, .fortune-wheel__curve-2").toggleClass("hidden");
            $(".fortune-wheel").removeClass("fortune-wheel--without-after");
            this.reopen.onclick();
        });
    }

    getRotationDegrees(obj) {
        var matrix = obj.css("-webkit-transform") ||
            obj.css("-moz-transform") ||
            obj.css("-ms-transform") ||
            obj.css("-o-transform") ||
            obj.css("transform");
        if (matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            var a = values[0];
            var b = values[1];
            var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            
        } else { var angle = 0; }
        return (angle < 0) ? angle + 360 : angle;
    }

    spinTo(id) {
        var block = this.data.points[id];
        var degrees = (this.data.spins * 360) - this.getRotationDegrees(block);
        var rotate = "rotate(" + degrees + "deg)";
        $(".fortune__circle").css({ transform: "", transition: "unset", animation: "unset" })
        setTimeout(() => {
            $(".fortune__circle").css({ "transform": rotate, transition: this.data.animation });
        }, 200);
        return block;
    }

    checkUp(obj) {
        return this.promise = new Promise(resolve => {
            setTimeout(() => {
                var interval = setInterval(() => {
                    console.log(this.getRotationDegrees(obj));
                    console.log(this.getRotationDegrees($(".fortune__circle")));
                    
                    if ((this.getRotationDegrees(obj) + this.getRotationDegrees($(".fortune__circle"))) == 360) {
                        clearInterval(interval);
                        resolve();
                        return;
                    }
                }, 500);
            }, this.data.duration * 1000);
        });
    }

    async win(data = {}) {
        var block = this.spinTo(data.id);
        setTimeout(() => {
            block.find(".weapon-skins__image").attr({ src: data.skin.image });
            block.find(".sorted-skins__skin-title").html(data.skin.title);
        }, 3000);
        await this.checkUp(block);
        $(".fortune__circle, .fortune-wheel__inner, .fortune-wheel__curve-1, .fortune-wheel__curve-2").toggleClass("hidden");
        $(".fortune-wheel").addClass("fortune-wheel--without-after");
        return this.promise;
    }

    count(n) {
        var height = +$(".fortune__item").css("height").replace("px", "");

        console.log("You have " + n + " block in it");
        console.log("Each block has " + (360 / n) + " degrees");
        console.log("Each block has " + (114 / (360 / n)) + " ratio");
        console.log("Each block width is " + (height / (114 / (360 / n))) + "px");

        $(".fortune__item").each(function (i) {
            $(this).css("transform", "rotate(" + ((360 / n) * i) + "deg) translateY(var(--wheel-indent))");
        });
    }
}

const features = new class {
    constructor() {
        this.sound = new features_sound();
        this.lang = new features_lang();
        this.timer = new features_timer();
        this.wheel = new features_wheel();
    }
}

// Functions

function num_split(number = 0, bandwidth = 0) {
    var string = number.toString(),
        length = string.length,
        bandwidth = length >= bandwidth ? 0 : bandwidth - length,
        output = new Array(bandwidth).fill(0);

    for (var i = 0; i < length; i++) {
        output.push(+string.charAt(i));
    }

    return output;
}