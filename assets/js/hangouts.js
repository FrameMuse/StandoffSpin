// Extending Functions

String.prototype.intConvert = function () {
    return parseInt(this, 10);
}

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

$(".tab-swithcer__button").click(function () {
    // Switching Active Button
    $(".tab-swithcer__button").removeClass("tab-swithcer__button--active");
    var tab = $(this).addClass("tab-swithcer__button--active").attr("tab");
    // Switching Tab
    $("[class *= 'js-tab-']").addClass("hidden");
    $("[class *= 'js-tab-" + tab + "']").removeClass("hidden");
});

// Classes

class features_lang {
    constructor() {
        this.tap = "rus"; // Default "rus"
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
    init() {
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

class features_popup {
    constructor() {
        this.html = `<div class="popup" hidden="hidden"><div class="popup__cover"></div><div class="popup-window scale-out"><div class="popup-window__close">✖</div><div class="popup-window__article"><span class="popup-window__title"></span><span class="popup-window__summary"></span></div><div class="popup-window__content"></div><div class="popup-window__help">Есть вопросы? Пишите в <a href="https://vk.com/standoffroll" classname="popup-window__marked">группу поддержки VK</a></div></div></div>`;
        this.on = function () { };
        this.default();
    }

    default() {
        if ($(".popup").length == 0) {
            $("body").append(this.html);
        }
        // Events
        $(".popup-window__close, .popup__cover").click(function () {
            var popup = $(".popup");
            popup.find(".popup-window").removeClass("scale-out scale-in").addClass("scale-out");
            setTimeout(() => {
                return popup.attr("hidden", "");
            }, 200);
        });
    }

    tend(option) {
        var element = ".popup-window__" + option;
        return $(element);
    }

    wEdit(options = {}) {
        for (var option in options) {
            this.tend(option).html(options[option]);
        }
    }

    open($window, options = {}) {
        // Fetching
        this.wText = function(ref) {
            var wText = "popup." + $window + ".";
            return getLanguage(wText + ref);
        }
        this.title = this.wText("title");
        this.summary = this.wText("summary");

        // Clearing
        this.wEdit({
            title: null,
            summary: null,
            content: null,
            help: getLanguage('popup.help.html')
        });

        this.on($window, options);

        // Animation
        $(".popup").removeAttr("hidden");
        setTimeout(() => $(".popup-window").removeClass("scale-out scale-in").addClass("scale-in"), 50);
    }

    close() {
        $(".popup-window__close, .popup__cover").click();
    }
}

class features_referal {
    init() {
        this.name = name;
        this.default();
        this.progress_block = '<div class="goal__line"><div class="goal__line--line-progress"></div><div class="goal__counter"><span class="goal__counter--icon"></span><span class="goal__counter--amount"></span></div></div>';
        this.commit_progress(2, 89);
    }

    default() {
        this.goals_number = $(".goal").length;
        this.width = $(this.name).outerWidth();
        this.goal_width = $(".goal").outerWidth();
        this.goal_height = $(".goal__image").outerHeight();
        this.goal_indent = $(".goal[data-goal-id='2']").css("margin-left").replace("px", "").intConvert();
        this.goal_image = $(".goal__image").outerWidth();
        this.goal_goal_height = $(".goal__goal").outerHeight();
    }

    create_progress_block() {
        if (this.goals_number <= 1) {
            console.error("Too few elements at the page (" + this.goals_number + ")");
            return;
        }
        $(this.name).append(this.progress_block);
    }

    create_goal(goal__goal, goal__level, goal__image, goal__rewards, goal__reached = "") {
        if (goal__reached) var goal__reached = "goal__reached";
        var goal_sample = '<div class="goal ' + goal__reached + '" data-goal-id="' + this.goals_number + '"><div class="goal__goal">' + goal__goal + '</div><div class="goal__image"><img class="goal__image--image" src="' + goal__image + '"></div><div class="goal__level">' + goal__level + '</div><div class="goal__rewards">' + goal__rewards + '</div>';
        this.goals_number++;
        return goal_sample;
    }

    add_goal(options) {
        var html = this.create_goal(options["goal"], options["level"], options["image"], options["rewards"], options["reached"]);
        $(this.name).append(html);
    }

    get_progress(goal_number, percent) {
        var step = this.goal_width + this.goal_indent;
        var indent = step * goal_number;
        var percent = percent / 100;
        var progress = (indent - step) + (this.goal_width) + ((step * percent)) - step;
        return progress;
    }

    commit_progress(goal_number, percent, counter) {
        var progress = this.get_progress(goal_number, percent);
        if (progress > this.width) {
            console.log(progress);
            console.error("Commited line is too big for '" + this.name + "'");
            return progress + "px";
        }
        if (progress < 0) progress = 0;
        if (this.goals_number <= 1) {
            console.error("Too few elements at the page (" + this.goals_number + ")");
            return;
        }
        if ((percent >= 70 && percent <= 100) || (percent >= 30 && percent <= 2)) {
            $(".goal__counter").addClass("hidden");
        } else {
            $(".goal__counter").removeClass("hidden");
        }
        if (counter) $(".goal__counter--amount").html(counter);
        $(".goal__line--line-progress").css("width", progress + "px");
        $(".goal__counter").css("left", progress - ($(".goal__counter").outerWidth() / 2) + "px");
        $(".goal__line").css("top", this.goal_image_indent + this.goal_goal_height + (this.goal_height / 2) + "px");
    }
}

const features = new class {
    constructor() {
        this.sound = new features_sound();
        this.lang = new features_lang();
        this.timer = new features_timer();
        this.wheel = new features_wheel();
        this.popup = new features_popup();
        this.referal = new features_referal();
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

function getLanguage(...data) {
    console.log(...data);
    return "jopa";
}