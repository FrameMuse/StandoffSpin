// Vars

var config = {},
    button_more = {
        contracts: 1,
        inventory: 1,
        history: 1,
        battles: 1,
    },
    sorted_skin_html = `<div class="sorted-skins__unit"><div class="sorted-skins__marks"><span class="sorted-skins__cost skewed-element"></span><div class="sorted-skins__icons"><div class="sorted-skins__icon sorted-skins__icon--green skewed-element js-item-withdraw"><span class="sorted-skins__icon--arrow"></span></div><div class="sorted-skins__icon sorted-skins__icon--orange skewed-element js-item-sell"><span class="sorted-skins__icon--dollar"></span></div></div></div><div class="weapon-skins__weapon"><img src="" class="weapon-skins__image"></div><div class="sorted-skins__skin-title"><span class="sorted-skins__skin-title--0"></span><span class="sorted-skins__skin-title--1"></span></div></div>`,
    sorted_contract_html = `<div class="sorted-contracts__unit"><div class="sorted-contracts__extend"><div class="sorted-contracts__skins"></div><div class="sorted-contracts__text gray">Стоимость контракта <span class="white skewed-text"></span></div></div></div>`,
    sorted_battle_html = `<div class="sorted-battles__battle"><div class="sorted-battles-player"><div class="weapon-skins__weapon"><img src="" class="weapon-skins__image"><span class="weapon-skins__quality weapon-skins__quality--skyblue"></span></div><div class="sorted-battles-player__info"><img src="" alt="" class="sorted-battles-player__image"><span class="sorted-battles-player__price"></span></div></div><img src="" alt="" class="sorted-battles__case-image"><div class="sorted-battles-player"><div class="weapon-skins__weapon"><img src="" class="weapon-skins__image"><span class="weapon-skins__quality weapon-skins__quality--pink"></span></div><div class="sorted-battles-player__info"><img src="" alt="" class="sorted-battles-player__image"><span class="sorted-battles-player__price"></span></div></div></div>`;
// Extending Functions

String.prototype.intConvert = function () {
    return parseInt(this, 10);
};

String.prototype.num_split = function () {
    var output = [],
        string = this.toString(),
        length = string.length;

    for (var i = 0; i < length; i++) {
        output.push(+string.charAt(i));
    }

    return output;
};

String.prototype.multiReplace = function (array, replacement) {
    var string = this;
    for (var i in array) {
        string = string.replace(new RegExp(array[i], 'g'), replacement);
    }
    return string;
};

String.prototype.ias = function (argument1 = "", argument2 = "") {
    if (argument1 == "" && argument2 == "") return interpret.JSDOM(this);
    return this.multiReplace([`{${argument1}}`], argument2);
};

Number.prototype.toPx = function (parent = "html") {
    return this * $(parent).css("font-size").replace("px", "");
};

Array.prototype.last = function (argument1) {
    if (this == null) return;
    switch (typeof argument1) {
        case "function":
            const $this = this[this.length - 1];
            argument1.apply($this, [$this]);
            return this[this.length - 1];
            break;
        default:
            if (argument1 == null)
                return this[this.length - 1];
            return this.slice(Math.max(this.length - argument1, 0));
            break;
    }
};

// Additional Functions

window.getLanguage = (param) => {
    var split = param.split(".");
    var result = window._language;

    for (var v of split) {
        if (!result[v]) {
            result = "not found " + param;
            break;
        }
        result = result[v];
    }

    return result;
};

// Jquery

$.Postpone = function () {
    var $resolve, $reject;
    this.promise = new Promise((resolve, reject) => {
        $resolve = resolve;
        $reject = reject;
    });
    if (typeof this.states != "object")
        this.states = [];
    var status_id = this.states.push({
        status: "pending",
    });

    const $this = this;

    return {
        index: status_id - 1,
        promise: this.promise,
        resolve: async function () {
            $resolve();
            $this.states[this.index]["status"] = "resolved";
        },
        reject: function () {
            $reject();
            $this.states[this.index]["status"] = "rejected";
        },
        then: function ($then) {
            $this.promise.then((r) => { $this.states[this.index]["status"] = "resolved"; $then(r); }, () => { this.state = "rejected" });
        },
        status: function () {
            return $this.states[this.index]["status"];
        },
    };
};

$.Defered = class {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.$resolve = resolve;
            this.$reject = reject;
            this.status = "pending";
            this.value = "";
        });
    }

    deconstruct(value) {
        //this.resolve = "";
        //this.reject = "";
        this.value = value;
    }

    resolve(value = "") {
        this.status = "resolved";
        this.$resolve(value);
        return this.deconstruct(value);
    }

    reject(value = "") {
        this.status = "rejected";
        this.$reject(value);
        this.deconstruct(value);
    }

    then(fulfilled, rejected = () => {}) {
        return this.promise.then((value) => {
            if (this.status == "pending") this.resolve();
            fulfilled(value);
        }, (value) => {
            if (this.status == "pending") this.reject();
            rejected(value);
        });
    }
};

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
    scrollTo: function (offset = false, duration = 400) {
        $("html").animate({ scrollTop: $(this).offset().top + (offset != false ? offset : config["AutoScrollOffset"].toPx()) }, duration);
    },
    timer: async function (days_on = false) {
        typeof config.intervals != "object" ? config.intervals = [] : (function () {
            config.intervals.filter(function (interval) {
                clearInterval(interval);
            });
            config.intervals = [];
        })();
        this.each(function (i) {
            var data_time = $(this).attr("data-time");
            var data_days = $(this).data("days");

            config.intervals.push(setInterval(() => {
                if (+data_time) {
                    var timestamp = new Date(+data_time);
                } else {
                    var timestamp = new Date(new Date(data_time).getTime() - Date.now());
                }

                if (days_on || +data_days) {
                    var time = timestamp.toISOString().substr(8, 11).replace("T", ":");
                } else {
                    var time = timestamp.toISOString().substr(11, 8);
                }


                if (timestamp < 0) {
                    clearInterval(config.intervals[i]);
                    $(this).parent().remove();
                    eval($(this).attr("ontimerover"));
                } else $(this).html(time);
                if (+data_time) data_time = (data_time - 1000);
            }, 1000));
        });
    },
});

// Const Classes

class interpret {
    static JSDOM(string) {
        if (string == null) return string;
        var brackets = [string.indexOf('{'), string.indexOf('}')];
        function createSpan(spot) {
            return `<span class="js-${spot}"></span>`.multiReplace(['=>'], '-').multiReplace(['->'], '_');
        }
        while (brackets[0] != -1 && brackets[1] != -1) {
            var brackets = [string.indexOf('{'), string.indexOf('}')];
            var $var = string.slice(brackets[0] + 1, brackets[1]);
            var string = string.multiReplace(['{' + $var + '}'], createSpan($var));
        }
        return string;
    }
}

class ProgressBar {
    static async start() {
        this.progress = new $.Defered();
        this.rail = 0;
        this.TimerSteps = [
            { time: 500, width: 30 },
            { time: 350, width: 45 },
            { time: 450, width: 55 },
            { time: 250, width: 60 },
            { time: 750, width: 80 },
        ];
        $(".load-indicator").css({ opacity: 1 });
        $(".load-indicator__fill").css({ width: 15 + "%" });
        $("body, button, input, a").css({ cursor: "wait" });

        for (var i = 0; i < this.TimerSteps.length; i++) {
            await delay(this.TimerSteps[i]["time"]);
            if (this.progress.status == "resolved") return;
            $(".load-indicator__fill").css({ width: this.TimerSteps[i]["width"] + "%" });
        }
    }

    static end() {
        this.progress.resolve();
        $(".load-indicator__fill").css({ width: 100 + "%" });
        setTimeout(() => {
            $(".load-indicator__fill").css({ width: "" });
            $(".load-indicator").css({ opacity: 0 });
            $("body, button, input, a").css({ cursor: "" });
        }, 350);
    }
}

const api = new class {
    constructor() {
        this.version = "v1";
        this.host = "https://standoffspin.ru";
        this.path = this.host + "/api/" + this.version;
        this.token = $('meta[name="csrf-token"]').attr('content');
    }

    request(method, url, params = {}, success) {
        // Request
        $.ajax({
            url: this.url(url),
            method: method,
            headers: {
                'X-CSRF-TOKEN': this.token,
            },
            dataType: 'json',
            data: $.param(params),
            success: function (result) {
                if (page.dev) {
                    page.support.notify_dev("success", result);
                    return;
                }

                if ("error" in result) {
                    page.support.notify("error", getLanguage(result.error_msg));
                    // Progress
                    ProgressBar.end();
                    return;
                } else success(result);
            },
            error: (error) => {
                if (page.dev) {
                    page.support.notify_dev("error", error);
                    return;
                }
                console.warn("API Request Error:", error);
                if (typeof error.responseJSON == "undefined") error.responseJSON = { message: "Undefined error" };
                page.support.notify(error.statusText, `API Request Error: "` + error.responseJSON.message + `"`);
                // Progress
                ProgressBar.end();
            },
        });
    }

    post(url, params = {}, success = function () { }) {
        this.request("POST", url, params, success);
    }

    get(url, params = {}, success = function () { }) {
        this.request("GET", url, params, success);
    }

    url(path) {
        return this.path + path.toString().multiReplace([",", "//"], "/");
    }
}

const postLoader = new class {
    constructor() {
        this.scripts = [];
        $(window).on("load", () => this.load());
    }

    add($function) {
        this.scripts.push($function);
    }

    load() {
        this.scripts.forEach(element => element());
    }
}

const DOM = new class {
    constructor() {
        this.targets = [];
        this.observer = new MutationObserver(MutationRecord => this.callback(MutationRecord));
    }

    callback(mutationsList) {
        mutationsList.forEach(mutation => {
            this.targets.filter(lisnter => {
                if (lisnter.target === mutation.target)
                    lisnter.action(mutation.type, lisnter.target);
            });
        });
    }

    listen(target, action, mutations = { attributes: true, childList: true, subtree: true }) {
        $(target).each((i, e) => {
            this.targets.push({
                target: e,
                action: action,
            });
            this.observer.observe(e, mutations);
        });
    }

    update(prefix, changes, separate = false) {
        var origin = ".js-" + prefix + "-";
        for (const key in changes) {
            $(origin + key).html(separate ? split_number(+changes[key]) : changes[key]);
        }
    }

    on(event, prefix, handlers) {
        var origin = ".js-" + prefix + "-";
        for (const key in handlers) {
            $(document).on(event, origin + key, handlers[key]);
        }
    }

    click(prefix = [], handler = () => { }) {
        switch (typeof prefix) {
            case "array":
                this.on("click", prefix[0], {}[prefix[1]] = handler);
                break;

            default:
                $(document).on("click", prefix, handler);
                break;
        }
    }

    $(prefix, name) {
        return $(".js-" + prefix + "-" + name);
    }
}

// Classes

class features_lang {
    constructor() {
        this.tap = "ru"; // Default "ru";
        this.onclick = function () { };
        this.path = "/assets/img/icons/";
        const $this = this;

        $(".js-option-lang").click(() => {
            var tap = this.toggleTap("ru", "en");
            $(".topbar-language__icon").css({ "background-image": `url(${this.path + tap + ".png"})` });
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
                days: 0,
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
                        if (this.single_discount("hours", 23)) {
                            if (this.single_discount("days", 344)) {
                                clearInterval(interval);
                                resolve();
                                return;
                            }
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
        this.promise = new $.Defered();
        this.reopen = {
            onclick: function () { },
        }
        this.data = {
            spins: 4, // Кол-во оборотов перед тем как дойдёт до нужного блока
            animation: "16s cubic-bezier(.1, 0, 0, 1) transform",
            duration: 16 * 1000,
            only: true,
            multiplies: {
                0: 1,
                1: 2,
                2: 3,
                3: 4,
                4: 5,
                5: 10,
            },
        }
    }

    __init() {
        ProgressBar.start();
        this.promise = new $.Defered();
        this.data.current = {
            items: [],
        };
        this.count(12);
    }

    init() {
        this.__init();
        //this.stop_wheel();
        // Multipling
        this.multiple(this.data.multiplier);
        this.count(12);
        // Changing Box models
        $(".box").addClass("box--no-indent");
        this.box_view(null);
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

    stop_wheel() {
        var circle = $(".fortune__circle");
        var startPosition = this.getRotationDegrees(circle);
        circle.css({
            animation: "unset",
            transform: `rotate(${startPosition}deg)`,
        });
    }

    spinTo(id, atWheel = 0, reverse = false, random = false) {
        var block = this.find_item(atWheel, id);
        var random = random ? get_random_int(-this.data.degrees_per_block / 2, this.data.degrees_per_block / 2) : 0;
        var degrees = (this.data.spins * 360) - this.getRotationDegrees(block) + random;
        var circle = block.parent();

        this.stop_wheel();

        anime({
            targets: circle.get(),
            rotate: (reverse ? -degrees - 60 : degrees) + "deg",
            easing: 'cubicBezier(.1, 0, 0, 1)',
            duration: 16000,
            complete: () => this.promise.resolve(),
        });

        return block;
    }

    __checkUp(obj, id) {
        return new Promise(resolve => {
            setTimeout(() => {
                var interval = setInterval(() => {
                    if ((this.getRotationDegrees(obj) + this.getRotationDegrees($(".fortune-wheel[data-id='" + id + "'] .fortune__circle"))) == 360) {
                        clearInterval(interval);
                        resolve();
                        return;
                    }
                }, 500);
            }, this.data.duration * 1000);
        });
    }

    win(data = {}, atWheel = 0, fast = false) {
        // Fix a wheel position
        //this.stop_wheel();
        // Variables
        var skin = fast ? this.find_item(atWheel, 8) : this.spinTo(8, atWheel, false, true),
            wheel = skin.parent().parent(),
            timeout = fast ? 0 : 3000;
        setTimeout(() => {
            // Skin
            ItemsController.CreateItem({ icons: false });
            ItemsController.ModifyItemByData(data);
            ItemsController.AppendItemAfter(wheel.find(".fortune-wheel__header"));
            ItemsController.config({
                item: {
                    marks: false
                }
            });
            ItemsController.ReplaceWithItemContent(skin);
            // Setting Weapon ID
            wheel.find(".js-wheel-sell-item").attr({ "weapon-id": data.id });
        }, timeout);
    }

    multiple_win(data = {}, fast = false, overideThen = false) {
        // Vars
        this.sum = 0;
        this.data.current = data;
        data.filter(async (item, id) => {
            this.win(item, id, fast);
            this.sum += item.item.price;
            // Setting Inner Price
            FortuneWheelController.SetInnerPrice(id, item.item.price);
        });
        // Wheel Promise
        if (fast) this.promise.resolve();
        // Aftermaths
        if (!overideThen) this.promise.then(() => {
            DOM.update("wheel", {
                "all-prices": alter_by_currency(this.sum, true)
            });
            $(".fortune__circle, .fortune-wheel__inner, .fortune-wheel__curve-1, .fortune-wheel__curve-2").toggleClass("hidden");
            $(".fortune-wheel").addClass("fortune-wheel--final");
            if (this.data.only) {
                //$(".fortune-wheel__buttons").parent().not(".hidden").scrollTo();
            } else {
                this.box_view(1);
                //$(".fortune-wheel__buttons1").scrollTo();
            }
            //$(".fortune-wheel__buttons").parent().not(".hidden").scrollTo();
            // Remove box--no-indent Class
            $(".box").removeClass("box--no-indent");
        });
        // Progress
        ProgressBar.end();
        // Return
        return this.promise;
    }

    count(n) {
        this.number = n;
        this.data.degrees_per_block = 360 / n;
        var height = +$(".fortune__item").css("height").replace("px", "");

        //console.log("You have " + n + " block in it");
        //console.log("Each block has " + (360 / n) + " degrees");
        //console.log("Each block has " + (114 / (360 / n)) + " ratio");
        //console.log("Each block width is " + (height / (114 / (360 / n))) + "px");

        $(".fortune__item").each(function (i) {
            $(this).css({
                transform: "rotate(" + ((360 / n) * i) + "deg) translateY(var(--wheel-indent))",
            });
        });
        $(".fortune-wheel").css({
            "--wheel-item-skew": height / (114 / (360 / n)) + "px",
            "--wheel-underline-width": "calc(0.625em / " + 114 / (360 / n) + ")",
        });
    }

    find_item(wheel_id, block_id) {
        var item = $(".fortune-wheel[data-id='" + wheel_id + "'] .fortune__item:nth-child(" + block_id + ")");
        if (item.length > 0) return item; else throw "There is no such an item";
    }

    multiple(x) {
        this.tideUp();

        var fortune = $(".fortune-wheel"),
            box = fortune.parent();

        for (var i = 1; i < x; i++) {
            box.append(fortune.clone().attr("data-id", i))
        }

        $(".fortune-wheel:not([data-id])").remove();
        $(".fortune-wheel__inner").removeClass("fortune-wheel__inner--0 fortune-wheel__inner--1");
        if (x > 1) {
            $(".fortune-wheel__inner").addClass("fortune-wheel__inner--1");
            this.data.only = false;
        } else {
            $(".fortune-wheel__inner").addClass("fortune-wheel__inner--0");
            this.data.only = true;
        }
        if (page.mobile.if) {
            //$(".box").css("--wheel-font-size", "3.5px");
            return;
        }
        if (x >= 2) $(".box").css("--wheel-font-size", "5.25px");
        //if (x >= 3) $(".box").css("--wheel-font-size", "3.5px");
    }

    tideUp() {
        $(".box").css("--wheel-font-size", "");
        $(".fortune-wheel").each(function (i) {
            if (i != 0) $(this).remove();
        });
    }

    box_view(n = 0) {
        if (n == null) $("[class *= 'box__view']").addClass("hidden");
        $(".box__view--" + n).removeClass("hidden");
    }
}

class features_popup {
    constructor() {
        this.on = {};
        this.tmp = {};
        this.closed = new $.Defered();
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

    fadeIn(obj) {
        $(".popup").removeAttr("hidden");
        setTimeout(() => {
            obj.removeClass("scale-out scale-in").addClass("scale-in")
        }, 50);
    }

    fadeOut() {
        var popup = $(".popup");
        popup.find("> *:not(.popup__cover)").removeClass("scale-out scale-in").addClass("scale-out");
        setTimeout(() => {
            return popup.attr("hidden", "");
        }, 200);
    }

    open($window, options = {}) {
        // Fetching
        this.wText = function (ref) {
            var wText = "popup." + $window + ".";
            return getLanguage(wText + ref);
        }
        this.title = this.wText("title");
        this.summary = this.wText("summary");

        // Clearing
        this.wEdit({
            title: this.title,
            summary: this.summary,
            content: null,
            help: getLanguage('popup.help')
        });

        prevent_error_function(() => {
            this.on[$window].apply(this, [options]);
        });

        // Animation
        this.fadeIn($(".popup-window"));
        // Return Promise
        return this.closed = new $.Defered();
    }

    close(force = false) {
        if (force) this.fadeOut();
        this.fadeOut();
        setTimeout(this.closed.resolve, 500);
    }
}

class features_referal {
    init() {
        this.default();
        this.progress_block = '<div class="goal__line"><div class="goal__line--line-progress"></div><div class="goal__counter"><span class="goal__counter--icon"></span><span class="goal__counter--amount"></span></div></div>';
    }

    default() {
        this.counter_indent = 1;
        this.goal = {
            width: $(".goal").outerWidth(),
            height: $(".goal__image").outerHeight(),
            indent: $(".goal[data-goal-id='2']").css("margin-left").replace("px", "").intConvert(),
            image_width: $(".goal__image").outerWidth(),
            goal_height: $(".goal__goal").outerHeight(),
        };
        this.goals = {
            number: $(".goal").length,
        };
        this.goals.width = (this.goal.width * this.goals.number) + (this.goal.indent * (this.goals.number - 1));
        $(".goal__line").css({ width: this.goals.width - (15.85).toPx() + "px" })
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
        var counter_indent = this.counter_indent.toPx();
        var goal = this.goal;
        var goal_number = (goal_number < 1 ? 1 : goal_number);
        var step = (this.goal.width + this.goal.indent) * (goal_number - 1);
        var goal_image_indent = (goal.width - goal.image_width) / 2;
        var percent = percent / 100;
        var progress = (step + ((goal.indent + counter_indent + 12) * percent)) + goal_image_indent + counter_indent;
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
        $(".goal__counter--amount").html(counter);
        $(".goal__line--line-progress").css("width", progress + "px");
        $(".goal__counter").css("left", progress - ($(".goal__counter").outerWidth() / 2) + "px");
        $(".goal__line").css("top", this.goal_image_indent + this.goal_goal_height + (this.goal_height / 2) + "px");
    }
}

class features_contract {
    constructor() {
        this.onpop = function () { };
        this.spot = new class {
            constructor() {
                this.error = function () { };
                this.saf = true;
                this.cautionMap = {
                    insufficient: getLanguage("contracts.text.insufficient"),
                    ranged: getLanguage("contracts.text.ranged"),
                };
            }
            init() {
                this.spots = [];
                this.caution();
                $(".contract__spot").each((i, e) => {
                    this.spots.push({
                        status: "unoccupied",
                        object: e,
                        data: {
                            title: null,
                            amount: null,
                            weapon_id: null,
                        },
                    });
                    $(e).attr("data-id", i);
                });
            }

            takePlace(obj) {
                var avail = this.whichAvail().shift(),
                    element = this.setOcp(avail);
                if (!element) return;
                obj.clone().appendTo(element);
                this.data("get", avail);
                obj.remove();
                // Extra
                this.caution();
            }

            freeUpPlace(obj) {
                var id = obj.parent().attr("data-id");
                if (!this.setUnocp(id)) return;

                obj.clone().appendTo(
                    $(".sorted-skins")
                );
                this.data(null, id);
                obj.remove();
                // Extra
                this.caution();
            }

            whichAvail($status = "unoccupied") {
                var array = [];
                for (var i = 0; i < this.spots.length; i++) {
                    if (this.spots[i]["status"] == $status) {
                        array.push(i);
                    }
                }
                return array;
            }

            setOcp(index) {
                try {
                    this.spots[index]["status"] = "occupied";
                    return this.spots[index]["object"];
                } catch (error) {
                    this.error("Exceeded_index_range");
                    return false;
                    //console.error("Exceeded an index range;", error);
                }
            }

            setUnocp(index) {
                try {
                    this.spots[index]["status"] = "unoccupied";
                    return this.spots[index]["object"];
                } catch (error) {
                    this.error("Exceeded_index_range");
                    return false;
                    //console.error("Exceeded an index range;", error);
                }
            }

            data($switch, index) {
                switch ($switch) {
                    case "get":
                        const obj = this.spots[index]["object"];
                        this.spots[index]["data"] = {
                            title: $(obj).find(".sorted-skins__skin-title").html(),
                            amount: $(obj).find(".sorted-skins__cost").html().split(" ")[0],
                            weapon_id: $(obj).find(".sorted-skins__unit").attr("weapon-id"),
                        }
                        break;

                    case null:
                        this.spots[index]["data"] = {
                            title: null,
                            amount: null,
                            weapon_id: null,
                        };
                        break;
                }
            }

            caution() {
                var avail = this.whichAvail("occupied");
                if (avail.length >= 3) {
                    $(".contract__button").removeAttr("disabled");
                    $(".contract__caution").html(this.cautionMap["ranged"].ias());
                    this.saf = false;
                } else {
                    $(".contract__button").attr({ disabled: "" });
                    $(".contract__caution").html(this.cautionMap["insufficient"]).show();
                    this.saf = true;
                }
            }

            error(msg) {
                page.support.notify("warning", msg);
            }
        }
        this.promise = new $.Defered();
    }

    init() {
        $(".contract-result__input").attr("disabled");
        $(".contract-window")
            .appendTo(".popup")
            .removeClass("hidden");
        // Events
        $(".contract__button").click(() => {
            if (this.spot.saf == true) {
                this.onpop();
                return;
            }
            page.popup.fadeIn(
                $(".contract-window")
            );
            this.fill();
        });
    }

    fill() {
        for (var i = 0, sum = 0; i < this.spot.spots.length; i++) {
            $(".contract-window__table--row:nth-child(" + (i + 1) + ") .js-contract-row").html(
                this.spot.spots[i]["data"]["title"]
            );
            if (this.spot.spots[i]["status"] == "occupied") {
                sum += +this.spot.spots[i]["data"]["amount"];
            }
        }
    }

    count_sum() {
        for (var i = 0, sum = 0; i < this.spot.spots.length; i++) {
            if (this.spot.spots[i]["status"] == "occupied") {
                sum += + this.spot.spots[i]["data"]["amount"];
            }
        }
        return Number((sum).toFixed(3));
    }

    update_DOM() {
        const sum = this.count_sum();
        DOM.update("contract", {
            items: this.spot.whichAvail("occupied").length,
            sum: sum,
            price_min: alter_by_currency(sum / 4, true),
            price_max: alter_by_currency(sum * 4, true),
        });
    }
}

class features_canvas {
    init() {
        // SETTING ALL VARIABLES

        this.isMouseDown = false;
        this.canvas_out = $(".contract-window__canvas");
        this.canvas = this.canvas_out[0];
        this.canvas.width = this.canvas_out.outerWidth();
        this.canvas.height = this.canvas_out.outerHeight();
        this.body = $("body"); this.canvas
        this.ctx = this.canvas.getContext('2d');
        this.linesArray = [];
        this.currentSize = 1;
        this.currentColor = "rgb(225,225,225)";
        this.currentBg = "white";

        // DRAWING EVENT HANDLERS

        this.canvas.addEventListener('mousedown', () => { this.mousedown(this.canvas, event); });
        this.canvas.addEventListener('mousemove', () => { this.mousemove(this.canvas, event); });
        this.canvas.addEventListener('mouseup', () => {
            this.mouseup();
        });
    }

    save() {
        localStorage.removeItem("savedCanvas");
        localStorage.setItem("savedCanvas", JSON.stringify(this.linesArray));
        console.log("Saved canvas!");
    }

    redraw() {
        for (var i = 1; i < this.linesArray.length; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.linesArray[i - 1].x, this.linesArray[i - 1].y);
            this.ctx.lineWidth = this.linesArray[i].size;
            this.ctx.lineCap = "round";
            this.ctx.strokeStyle = this.linesArray[i].color;
            this.ctx.lineTo(this.linesArray[i].x, this.linesArray[i].y);
            this.ctx.stroke();
        }
    }

    getMousePos(canvas, evt) {
        var rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    mousedown(canvas, evt) {
        var mousePos = this.getMousePos(this.canvas, evt);
        this.isMouseDown = true
        var currentPosition = this.getMousePos(this.canvas, evt);
        this.ctx.moveTo(currentPosition.x, currentPosition.y)
        this.ctx.beginPath();
        this.ctx.lineWidth = this.currentSize;
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = this.currentColor;
    }

    mousemove(canvas, evt) {
        if (this.isMouseDown) {
            var currentPosition = this.getMousePos(this.canvas, evt);
            this.ctx.lineTo(currentPosition.x, currentPosition.y)
            this.ctx.stroke();
            this.store(currentPosition.x, currentPosition.y, this.currentSize, this.currentColor);
        }
    }

    store(x, y, s, c) {
        var line = {
            "x": x,
            "y": y,
            "size": s,
            "color": c
        }
        this.linesArray.push(line);
    }


    mouseup() {
        this.isMouseDown = false;
        this.store();
        this.redraw();
    }

    downloadCanvas(link, canvas, filename) {
        link.href = document.getElementById(canvas).toDataURL();
        link.download = filename;
    }
}

class features_paging {
    constructor() {
        // Begin
        this.pages = {};
        this.errors = {};
        this.fickle = ".ajax-fickle";
        this.DeviceType = "desktop";
        this.ScrollInspector = {};
        this.actionOnLoaded = [];
        this.AbleScrollDown = true;
        this.pageLoading = new $.Defered();
        this.onPageLoaded = () => { };

        postLoader.add(() => this.default());

        // Events
        $("body").append(`<div class="notifier"><div class="notifier__message"></div><span class="notifier__signal"></span></div>`);
        $(document).on("click", "a.ajax-link[href]", (e) => {
            e.preventDefault();
            // Progress
            ProgressBar.start();
            // Other
            this.pageLoading = new $.Defered();
            var href = $(e.currentTarget).attr("href").split("#!");
            if (href != null) {
                this.load(href[0], href[1]);
            } else console.error("The link attr is empty");
        });
    }

    default() {
        this.refresh();
        // Extending History API
        window.onpopstate = (event) => {
            this.__load(event.state.href, event.state.data);
        }
    }

    load(url, hashAction = false) {
        ProgressBar.start();
        this.dynamic_request(url, (result) => {
            // Histoty Push
            if (history.state == null) {
                history.replaceState({ href: url, data: result }, "", url);
            } else {
                history.pushState({ href: url, data: result }, "", url);
            }
            if (hashAction) this.save_hash(hashAction); else this.save_hash();
            this.final(result, url);
        });
        return this.pageLoading;
    }

    __load(url, result) {
        ProgressBar.start();
        this.final(result, url);
        return this.pageLoading;
    }

    refresh() {
        this.load(window.location.pathname);
    }

    dynamic_request(url, $success) {
        $.ajax({
            url: url,
            headers: {
                "DYNAMIC-REQUEST": true,
            },
            dataType: 'text',
            cache: false,
            success: $success,
            error: (error) => {
                this.pageLoading.reject();
                ProgressBar.end();
                console.warn("Page Loading Error:", error);
            },
            statusCode: this.errors[url.split("/")[1]],
        });

    }

    request(url, $success) {
        $.ajax({
            url: url,
            dataType: 'html',
            success: $success,
        });
    }

    final(result, url) {
        // Other
        this.pageLoaded = url.split("/");
        this.active_page = "/" + this.pageLoaded[1];
        $(this.fickle).html(result);
    }

    addPage(page_name, run) {
        page_name = page_name.replace("/", "");
        this.pages[page_name] = run;
    }

    __addPage(settings) {
        settings.page = settings.page.replace("/", "");
        if ("ScrollInspector" in settings) {
            this.ScrollInspector[settings.page] = function () {
                try {
                    settings.ScrollInspector.apply(new ScrollInspector("/" + settings.page));
                } catch (error) {
                    console.warn(error);
                }
            };
        }
        this.pages[settings.page + (settings.device != undefined ? "__mobile" : "")] = settings.action;
        this.errors[settings.page] = settings.errors;
    }

    EventPageLoaded(url, DeviceType = false) {
        url[1] += DeviceType ? "__" + DeviceType : "";
        if (url[1] in this.pages) try {
            this.pages[url[1]].apply(this, [url[2]]);
        } catch (error) {
            console.error(error);
            this.load("/");
        }
    }

    startActionOnLoaded() {
        if (!this.hash || this.hash == "") return false;
        this.actionOnLoaded[this.hash]();
    }

    isFirstInHistory() {
        return history.state != null && history.state.first;
    }

    set active_page(url) {
        // Jquery Event
        $("[class *= 'menu']").each(function () {
            var active_name = $(this).attr("class") + "__link--active";
            $(this).find("a").removeClass(active_name);
            $(this).find("a[href='" + url + "']").addClass(active_name);
        });
    }

    clear_hash() {
        history.replaceState(history.state, "", window.location.href.split('#')[0]);
    }

    notify(signal, message) {
        var singals = {
            error: 0,
            warning: 50,
            success: 100,
        };
        if (page.mobile.if) {
            var values = {
                bottom_start: "4em",
                bottom_end: "-5em",
            };
        } else {
            var values = {
                bottom_start: "4.5em",
                bottom_end: "-5em",
            };
        }

        $(".notifier").animate({ bottom: values.bottom_start, }, 350);
        $(".notifier__message").html(message);
        $(".notifier__signal").css({
            background: "hsl(" + singals[signal] + ", 50%, 40%)",
        }).animate({
            width: "100%",
        }, 5000, "linear", function () {
            $(".notifier").animate({ bottom: values.bottom_end, }, 350, () => $(this).css({ width: "" }));
        });
    }

    notify_dev(type, result) {
        if ($(".dev-log").length == 0) {
            $("body").append(`<div class="dev-log"><div class="dev-log__header"><span>Request Response: </span><span class="js-dev-log-type"></span></div><pre class="dev-log__body js-dev-log-content"></pre></div>`);
        }
        var json = JSON.stringify(result, undefined, 2),
            parsed_html = parse_html(json),
            colored_html = color_html(json, parsed_html);

        DOM.update("dev-log", {
            type: type,
            content: colored_html,
        })
    }

    save_hash(hash = false) {
        this.hash = hash ? hash : window.location.hash.split("!");
        this.clear_hash();
    }

    context(object) {
        object.apply(this);
    }
}

class features_liveFeed {
    constructor() {
        this.singleItem = `<div class="weapon-skins__weapon"><img class="weapon-skins__image"><span class="weapon-skins__quality"></span><div class="weapon-skins-owner"><img class="weapon-skins-owner__case-image"><span class="weapon-skins-owner__name"></span><a class="ghost ajax-link"></a></div></div>`;
        this.parsedItem = $.parseHTML(this.singleItem);
    }

    CreateByData(data) {
        this.item = $(this.parsedItem).clone();
        $(this.item).addClass("weapon-skins__quality--" + data.class_name);
        $(this.item).find(".weapon-skins__image").attr({ src: "/img/" + data.item_src });
        $(this.item).find(".weapon-skins-owner__case-image").attr({ src: "/img/" + data.case_image });
        $(this.item).find(".weapon-skins-owner__name").html(data.name);
        $(this.item).find("a.ghost").attr({ href: data.user_id });
    }

    AddToFeed() {
        $(this.item).prependTo(".live-drops__inner");
    }

    removeLast() {
        $(".live-drops__inner")
            .find(".weapon-skins__weapon:last-child")
            .remove();
    }
}

class features_mobile {
    constructor() {
        this.time = new Date().getTime();
        this.onMobile = function () { };

        if (this.isDeviceMobile()) {
            this.if = true;
            postLoader.add(() => {
                this.onMobile.apply(this);
            });
        } else this.if = false;
    }

    isDeviceMobile() {
        return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)) || (/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)));
    }
}

const page = new class {
    constructor() {
        this.dev = false;
        // Classes
        this.sound = new features_sound();
        this.lang = new features_lang();
        this.timer = new features_timer();
        this.wheel = new features_wheel();
        this.popup = new features_popup();
        this.referal = new features_referal();
        this.contract = new features_contract();
        this.canvas = new features_canvas();
        this.support = new features_paging();
        this.liveFeed = new features_liveFeed();
        this.mobile = new features_mobile();
        // Extra
        this.on = function () { };
    }

    set on($function) {
        $function();
    }

    setup(objectArray) {
        config = objectArray;
    }
}

class STNDFItems {
    static Sell(argument1, callback) {
        api.post("/item/sell", { id: typeof argument1 == "number" ? argument1 : +$(argument1).attr("weapon-id") }, callback);
    }

    static sellAll() {
        api.post("/item/sellall", {}, (result) => {
            page.popup.close();
            page.support.refresh();
            DOM.update("required-update", {
                balance: split_number(result.balance) + " Р"
            });
            page.support.notify("success", "Предметы успешно проданы");
        });
    }

    static CreateWithdrawal(params = {}, success = () => { }) {
        api.post("/withdraw/create", params, success);
    }

    static Callback(result) {
        page.support.notify("success", getLanguage("settings.notify"));
    }

    static StatusMap(status) {
        return {
            NOTHING: "",
            CONTRACT: `<div class="sorted-skins__icon sorted-skins__icon--blue skewed-element"><span class="sorted-skins__icon--contract"></span></div>`,
            SELL: `<div class="sorted-skins__icon sorted-skins__icon--orange skewed-element"><span class="sorted-skins__icon--dollar"></span></div>`,
            WITHDRAW: `<div class="sorted-skins__icon sorted-skins__icon--green skewed-element"><span class="sorted-skins__icon--arrow"></span></div>`,
            WAITING: `<div class="sorted-skins__icon sorted-skins__icon--green skewed-element"><span class="sorted-skins__icon--refresh"></span></div>`,
        }[status];
    }
}

// Controllers

class ItemsController extends STNDFItems {
    static RemoveItem(weapon_id) {
        $("[weapon-id='" + weapon_id + "'], [data-id='" + weapon_id + "']").remove();
    }

    static CreateItem(config = {}) {
        var clone = $(sorted_skin_html).clone();
        this.items = [clone];
        // Configuration
        this.config({ item: config });
    }

    static CreateContract(config = {}) {
        this.CreateItem(config);
        var clone = $(sorted_contract_html).clone().prepend(this.items.last());
        this.contracts = [clone];
    }

    static CreateBattle() {
        var clone = $(sorted_battle_html).clone();
        this.battles = [clone];
    }

    static ModifyItemByData(data = {}) {
        const params = this.parseData(data, { item_id: data.id, status: data.status });
        const StatusMap = this.StatusMap;
        this.items.last(function () {
            this.attr({ "data-id": params.item_id });
            this.find(".sorted-skins__cost").html(alter_by_currency(params.price, true));
            this.find(".sorted-skins__skin-title--0").html(params.name);
            this.find(".sorted-skins__skin-title--1").html(params.subname);
            this.find(".weapon-skins__image:only-child").attr({ src: "/img/" + params.image });
            this.addClass("sorted-skins__unit--" + params.class_name);
            // ---------------------------------------------------------------------------
            if (params.status != "NOTHING") {
                $(this).find(".sorted-skins__icons").empty().append(StatusMap(params.status));
            }
        });
    }

    static ModifyContractByData(params = {}) {
        this.ModifyItemByData(params);
        this.contracts.last(($this) => {
            params.item_list.filter((weapon) => {
                $this.find(".sorted-contracts__skins").append(this.CreateWeapon(weapon.item));
            });
            $this.find(".sorted-contracts__text span").html(alter_by_currency(params.price, true, true));
            $this.find(".sorted-skins__unit").replaceWith(this.items.last());
        });
    }

    static ModifyBattleByData(data = {}) {
        const params = this.parseData(data, {
            case_id: data.case_id,
            user_0: data.owner,
            user_1: data.rival,
            user_0_item: data.owner_item,
            user_1_item: data.rival_item,
        });
        this.battles.last(function () {
            this.attr({ "data-id": params.case_id });
            if (params.user_0_item.price > params.user_1_item.price) var status = 0; else
                if (params.user_0_item.price < params.user_1_item.price) var status = 1; else var status = 2;
            this.addClass("sorted-battles__battle--" + status);
            this.find(".sorted-battles__case-image").attr({ src: "/img/" + params.image });
            // ---------------------------------------------------------------
            this.find(".sorted-battles-player").each(function (i) {
                var user = params["user_" + i];
                var item = params["user_" + i + "_item"];
                // ---------------------------------------------------------------
                $(this).append(`<a href="/profile/${user.id}" class="ghost ajax-link"></a>`);
                $(this).find(".sorted-battles-player__image").attr({ src: user["photo"] });
                $(this).find(".sorted-battles-player__price").html(alter_by_currency(item["price"], true));
                // ---------------------------------------------------------------
                $(this).find(".weapon-skins__image").attr({ src: "/img/" + item["image"] });
                $(this).addClass("sorted-skins__unit--" + item["class_name"]);
            });
        });
    }

    static AppendItemTo(object) {
        var item = this.items.last();
        $(item).appendTo(object);
    }

    static AppendBattleTo(object) {
        var battle = this.battles.last();
        $(battle).appendTo(object);
    }

    static PrependItemTo(object) {
        var item = this.items.last();
        $(item).prependTo(object);
    }

    static AppendItemAfter(object) {
        var item = this.items.last();
        $(item).insertAfter(object);
    }

    static AppendContractTo(object) {
        var сontract = this.contracts.last();
        $(сontract).appendTo(object);
    }

    static ReplaceWithItemContent(object) {
        this.items.last($this => {
            var quality = $this.attr("class").replace("fortune__item", "").split("sorted-skins__unit--")[1];
            $(object)
                .attr({ class: "fortune__item" })
                .addClass("weapon-skins__quality--" + quality)
                .html($this.html());
        });
    }

    static config(config = {}) {
        if (config.item != "undefined") {
            this.items.last($this => {
                if (config.item.marks == false) $this.find(".sorted-skins__marks").remove();
                if (config.item.icons == false) $this.find(".sorted-skins__icons").remove();
                if (config.item.events == false) $this.find(".sorted-skins__icon").removeClass("js-item-withdraw js-item-sell");
            });
        }
    }

    static parseData(data, modifications = {}) {
        var data = "item" in data ? data.item : "win" in data ? data.win : "_case" in data ? data._case : data;
        for (const key in modifications) {
            data[key] = modifications[key];
        }
        return data;
    }

    static CreateWeapon(params = {}) {
        return `<div class="weapon-skins__weapon"><img src="${"/img/" + params.image}" class="weapon-skins__image"><span class="weapon-skins__quality weapon-skins__quality--${params.class_name}"></span></div>`;
    }
}

class FortuneWheelController {
    static SetInnerPrice(wheel_id, price) {
        $(".fortune-wheel[data-id='" + wheel_id + "'] .js-wheel-item-price").html(alter_by_currency(price, true))
    }

    static BattleInit() {
        page.wheel.__init();
    }

    static BattleCry(data = {}, wheelWinnerId = 0) {
        page.wheel.data.spins = 4.25;
        data.filter((itemData, id) => {
            // Variables
            var skin = page.wheel.spinTo(8, id, id == 0 ? false : true),
                wheel = skin.parent().parent(),
                timeout = 3000;
            setTimeout(() => {
                //wheel.find(".fortune-wheel__skin").prepend(`<span class="fortune-wheel__skin--price">${alter_by_currency(itemData.price, true)}</span>`);
                // Skin
                ItemsController.CreateItem({ marks: false });
                ItemsController.ModifyItemByData(itemData);
                ItemsController.PrependItemTo(wheel.find(".fortune-wheel__skin"));
                ItemsController.ReplaceWithItemContent(skin);
            }, timeout);
            // Extra
            ProgressBar.end();
        });

        page.wheel.promise.then(function () {
            $(".battle").addClass("battle__over--" + wheelWinnerId);
            $(".fortune-wheel__skin").removeClass("hidden");
            $(".battle__buttons").removeClass("hidden");
            if (page.mobile.if) {
                $(".fortune__circle, .fortune-wheel__curve-1, .fortune-wheel__curve-2").addClass("hidden");
                $(".fortune-wheel").addClass("fortune-wheel--final");
            }
        });
    }
}

class BalanceController {
    static UpdateBalance(balance) {
        BalanceController.CurrentBalance = balance;
        DOM.update("required-update", {
            balance: alter_by_currency(balance, true)
        });
    }

    static GetUserBalance() {
        if (ServiceController.userId == 0) return 0;
        return this.CurrentBalance;
    }

    static HasSufficientFunds(CustomPrice = false) {
        return this.GetUserBalance() >= (CustomPrice ? CustomPrice : ServiceController.CurrentService["Price"]);
    }

    static FundsLackAmount(CustomPrice = false) {
        return this.GetUserBalance() - (CustomPrice ? CustomPrice : ServiceController.CurrentService["Price"]);
    }
}

class ServiceController {
    static ServiceMap() {
        return {
            Name: "{Name}",
            Price: "{Price}",
        };
    }

    static set SetCurrentService(service) {
        if (this.MatchServiceMap(service)) {
            this.CurrentService = service;
        } else throw "Provided service map cannot be listed";
    }

    static MatchServiceMap(service) {
        for (const key in this.ServiceMap()) {
            if (!(key in service)) return false;
        }
        return true;
    }

    static LevelProgress(percent = 0) {
        $(".user-level__progress-line--indicator").css({ width: (percent > 100 ? 100 : percent) + "%" });
    }
}

class cache {

}

class filter {
    constructor(object) {
        filter.ElementsArray = $(object).get();
        filter.obj = $(object).find(">");
        filter.ExclusionMap = {
            name: function () { },
            price: function () { },
        };
    }

    static exclude(params = false) {
        if (params) {
            var ExclusionMap = this.ExclusionMap;
            if (params.name != undefined) ExclusionMap.name = this.Exclusion__name;
            if (params.price != undefined) ExclusionMap.price = this.Exclusion__price;
            $(this.obj).each(function () {
                try {
                    for (const key in ExclusionMap) ExclusionMap[key](this, params);
                } catch (error) { }
            });
        }
    }

    static Exclusion__name(context, params) {
        var names = [
            $(context).find(".sorted-skins__skin-title--0").html(),
            $(context).find(".sorted-skins__skin-title--1").html(),
        ];
        if (names.toString().multiReplace([",", " "], "").toLowerCase() == params.name.multiReplace([" "], "").toLowerCase()) {
            $(context).addClass("hidden");
        }
    }

    static Exclusion__price(context, params) {
        var price = alter_by_currency($(context).find(".sorted-skins__cost").html(), false);
        if ((price < params.price.min || price > params.price.max)) {
            $(context).addClass("hidden");
        }
    }
}

class ScrollInspector {
    constructor(page = "") {
        this.data = {
            page: page,
        };
        this.listeners = [];
        this.entry = new $.Defered();
        this.CurrentListener = this.GetOncrollEvent();
        window.addEventListener('scroll', this.CurrentListener);
    }

    GetOncrollEvent() {
        try {
            return async event => {
                await this.entry.promise;
                if (!event.isTrusted || event.type != "scroll") return;
                if (this.listeners != undefined) {
                    this.listeners.filter($this => {
                        if (event.path[1].scrollY >= $this.offset()) {
                            $this.event.apply($this.context, [event, this]);
                        }
                    });
                }
            };
        } catch (error) {
            this.deconstruct();
            console.error(error);
        }
    }

    OnScrollEvent(offset = 0, event = () => { }) {
        const $offset = typeof offset == "function" ? offset : function () {
            return typeof offset == "number" ? offset : $(offset).offset().top;
        };
        this.listeners.push({
            offset: $offset,
            event: event,
            context: this,
        });
        this.entry.resolve();
    }

    deconstruct() {
        window.removeEventListener('scroll', this.CurrentListener);
        delete this;
    }

    destroy() {
        getEventListeners(window).scroll.forEach((e) => {
            removeEventListener("scroll", e.listener);
        })
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

function prevent_error_function($function, ...$args) {
    // Prevent Unexpected Errors
    try {
        $function(...$args);
    } catch (error) {
        //console.warn("Function error prevented: " + error);
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function split_number(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function alter_by_currency(param, appendCurrency = false) {
    var multiplier = getLanguage('settings.multiplier'),
        currency = getLanguage('settings.currency'),
        number = (param.toString().multiReplace([" ", currency], "")) * multiplier;
    if (isFloat(number)) number = number.toFixed(2);
    return appendCurrency ? (number + ' ' + currency) : number;
}

function parse_html(html) {
    var regex = RegExp('[^":]*', 'g'),
        matches = html.match(regex);
    return matches;
}

function color_html(html, parsed_html) {
    parsed_html.forEach(value => {
        if (["", " ", ",", "}", "{", "[", "]", "(", ")"].includes(value) || value.search(",") > -1 || value.search("{") > -1 || value.search("}") > -1) return;
        html = html.replace(value, '<span class="dev-log__color">' + value + '</span>');
    });
    return html;
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

function get_random_int(min = 0, max = 2) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function IsDefined($this) {
    return $this != "undefined" && $this != undefined && typeof $this != "undefined";
}

function img_error(element, isAvatar = false) {
    element.src = '/assets/img/guest.png';
    page.popup.tmp.NeedsToSetAvatar = isAvatar;
}