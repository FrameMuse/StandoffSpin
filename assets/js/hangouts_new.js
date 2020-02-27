// Vars

var features_toLoad,
    button_more = {
        contracts: 1,
        inventory: 1,
        history: 1,
    },
    sorted_skin_html = `<div class="sorted-skins__unit"><div class="sorted-skins__marks"><span class="sorted-skins__cost skewed-element"></span><div class="sorted-skins__icons"><div class="sorted-skins__icon sorted-skins__icon--green skewed-element"><span class="sorted-skins__icon--arrow"></span></div><div class="sorted-skins__icon sorted-skins__icon--orange skewed-element"><span class="sorted-skins__icon--dollar"></span></div></div></div><div class="weapon-skins__weapon"><img src="" class="weapon-skins__image"></div><div class="sorted-skins__skin-title"><span class="sorted-skins__skin-title--0"></span><span class="sorted-skins__skin-title--1"></span></div></div>`,
    sorted_contract_html = `<div class="sorted-cotracts__unit"><div class="sorted-cotracts__extend"><div class="sorted-cotracts__skins"></div><div class="sorted-cotracts__text gray">Стоимость контракта <span class="white skewed-text"></span></div></div></div>`;

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

Array.prototype.last = function (argument1) {
    if (this == null) return;
    switch (typeof argument1) {
        case "function":
            argument1(this[this.length - 1]);
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
    timer: async function (days_on = false) {
        this.each(function () {
            var data_time = $(this).attr("data-time");
            var current = new Date(data_time);
            var interval = setInterval(() => {
                var timestamp = current - Date.now();
                var days = Math.floor(timestamp / (1000 * 60 * 60 * 24));
                var hours = Math.floor((timestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((timestamp % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((timestamp % (1000 * 60)) / 1000);
                var html = (days_on ? (days + ":") : "") + hours + ":" + minutes + ":" + seconds;

                if (timestamp < 0) {
                    clearInterval(interval);
                    $(this).html("EXPIRED");
                } else $(this).html(html);
            }, 1000);
        });
    },
});

// Const Classes

const api = new class {
    constructor() {
        this.version = "v1";
        this.host = "https://standoffspin.ru";
        this.path = this.host + "/api/" + this.version;
    }

    request(method, url, params = {}, success) {
        // Request
        $.ajax({
            url: this.url(url),
            method: method,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            dataType: 'json',
            data: $.param(params),
            success: function (result) {
                if (page.dev) {
                    page.support.notify_dev("success", result);
                    return;
                }

                if ("error" in result) {
                    page.support.notify("error", getLanguage(result.error_msg))
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
                page.support.notify(error.statusText, `API Request Error: "` + error.responseJSON.message + `"`)
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
        return this.path + path;
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
        this.reopen = {
            onclick: function () { },
        }
        this.data = {
            spins: 4, // Кол-во оборотов перед тем как дойдёт до нужного блока
            animation: "16s cubic-bezier(.1, 0, 0, 1) transform",
            duration: 16 * 1000,
            only: true,
        }
    }

    init() {
        page.support.progress = 75;
        page.wheel.reject = false;
        this.data.multiplier = {
            0: 1,
            1: 2,
            2: 3,
            3: 4,
            4: 5,
            5: 10,
        }[$(".box__input--active").attr("data-id")];
        this.data.current = {
            items: [],
        };
        this.multiple(this.data.multiplier);
        this.count(12);
        // Add box--no-indent Class
        $(".box").addClass("box--no-indent");
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

    spinTo(id, atWheel = 0) {
        var block = this.find_item(atWheel, id);
        var degrees = (this.data.spins * 360) - this.getRotationDegrees(block);
        var rotate = "rotate(" + degrees + "deg)";
        var circle = block.parent();

        circle.css({ animation: "unset" });

        const wait = new Promise(resolve => {
            var interval = setInterval(() => {
                if (circle.css("animation") != "spinning") {
                    resolve();
                    clearInterval(interval);
                }
            }, 75);
        });

        wait.then(() => {
            circle.css({ transform: rotate });
        });

        page.support.progress = 100;

        return block;
    }

    __checkUp(obj, id) {
        console.log(id);
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
        var skin = this.spinTo(8, atWheel),
            wheel = skin.parent().parent(),
            timeout = fast ? 0 : 3000;
        setTimeout(() => {
            // Skin
            ItemsController.CreateItem();
            ItemsController.ModifyItemByData(data.item);
            ItemsController.AppendItemAfter(wheel.find(".fortune-wheel__header"));
            // Setting Weapon ID
            wheel.find(".js-wheel-sell-item").attr({ "weapon-id": data.id });
        }, timeout);
        // Extra
        setTimeout(() => {
            page.support.progress = null;
        }, 250);
    }

    multiple_win(data = { }, fast = false) {
        this.sum = 0;
        this.data.current = data;
        data.filter(async (item, id) => {
            this.win(item, id, fast);
            this.sum += item.item.price;

            FortuneWheelController.setInnerPrice(id, item.item.price);
        });
        var checkUp = new Promise((resolve, reject) => {
            if (fast) {
                page.support.progress = null;
                resolve();
                return;
            }
            var interval = setInterval(() => {
                if (this.reject) {
                    reject();
                    clearInterval(interval);
                    return;
                }
            }, 250);
            setTimeout(() => {
                resolve();
                return;
            }, this.data.duration);
        });

        this.box_view(null);

        checkUp.then(() => {
            DOM.update("wheel", {
                "all-prices": alter_by_currency(this.sum, true)
            });
            $(".fortune__circle, .fortune-wheel__inner, .fortune-wheel__curve-1, .fortune-wheel__curve-2").toggleClass("hidden");
            $(".fortune-wheel").addClass("fortune-wheel--without-after");
            if (!this.data.only) this.box_view(1);
            // Remove box--no-indent Class
            $(".box").removeClass("box--no-indent");
        });

        return this.promise = checkUp;
    }

    count(n) {
        this.number = n;
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

        for (var i = 0; i < x; i++) {
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
            $(".box").css("--wheel-font-size", "3.5px");
            return;
        }
        if (x == 2) $(".box").css("--wheel-font-size", "5.25px");
        if (x >= 3) $(".box").css("--wheel-font-size", "3.5px");
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
        this.on = { };
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
            help: getLanguage('popup.help.html')
        });

        prevent_error_function(() => {
            this.on[$window].apply(this, options);
        });

        // Animation
        this.fadeIn($(".popup-window"));
    }

    close(force = false) {
        if (force) this.fadeOut();
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
        if ((percent >= 90 && percent <= 100) || (percent >= 10 && percent <= 2)) {
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

class features_contract {
    constructor() {
        this.onpop = function () { };
        this.spot = new class {
            constructor() {
                this.error = function () { };
                this.saf = true;
            }
            init() {
                this.spots = [];
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
                    $(".contract__caution").hide();
                    this.saf = false;
                } else {
                    $(".contract__caution").show();
                    this.saf = true;
                }
            }

            error(msg) {
                page.support.notify("warning", msg);
            }
        }
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
        DOM.update("contract", {
            items: this.spot.whichAvail("occupied").length,
            sum: this.count_sum(),
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
        this.fickle = ".ajax-fickle";
        this.progress = 15;
        postLoader.add(() => {
            this.default();
        });

        // Events
        $("body").append(`<div class="notifier"><div class="notifier__message"></div><span class="notifier__signal"></span></div>`);
        $(document).on("click", "a.ajax-link", (e) => {
            e.preventDefault();

            var href = $(e.currentTarget).attr("href");
            if (href != null) {
                this.load(href);
            } else console.error("The link attr is empty");
        });
    }

    default() {
        this.refresh();
        // Extending History API
        window.onpopstate = (event) => {
            if (this.isFirstInHistory()) {
                window.location.href = event.state.href;
                return;
            }
            $(this.fickle).html(event.state.data);
        }
    }

    load(url, saveHistory = true) {
        this.progress = 25;
        this.dynamic_request(url, (result) => {
            // Histoty Push
            if (history.state == null) {
                history.replaceState({ href: url, first: true, data: result }, "", url);
            } else if (saveHistory) {
                history.pushState({ href: url, data: result }, "", url);
            }
            this.final(result, url);
        });
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
            dataType: 'html',
            success: $success,
            error: (error) => {
                this.progress = null;
                console.warn("Page Loading Error:", error);
                if (typeof error.responseJSON == "undefined") error.responseJSON = { message: "Undefined error" };
                page.support.notify(error.statusText, `Page Loading Error: "` + error.responseJSON.message + `"`)
            },
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
        this.active_page = url;
        this.pageLoaded = url.split("/");
        $(this.fickle).html(result);
    }

    addPage(page_name, run) {
        page_name = page_name.replace("/", "");
        this.pages[page_name] = run;
    }

    onPageLoaded(url) {
        if (url[1] in this.pages) this.pages[url[1]](url[2]);
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

    set progress(percent) {
        if (percent == null) {
            var opacity = 0;
            percent = "";
        } else {
            var opacity = "";
            percent += "%";
        }
        $(".load-indicator")
            .css({ opacity: opacity })
            .find(".load-indicator__fill")
            .css({ width: percent });
    }

    notify(signal, message) {
        var singals = {
            error: 0,
            warning: 50,
            success: 100,
        };

        $(".notifier")
            .animate({ bottom: "0%", }, 350)
            .delay(10000).animate({ bottom: "-15%", }, 350);
        $(".notifier__message").html(message);
        $(".notifier__signal").css({
            background: "hsl(" + singals[signal] + ", 50%, 40%)",
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
}

class features_liveFeed {
    constructor() {
        this.singleItem = `<div class="weapon-skins__weapon"><img src="/img/nZQWFYGPHj-Screenshot_83.png" class="weapon-skins__image"><span class="weapon-skins__quality weapon-skins__quality--pink"></span><div class="weapon-skins-owner"><img src="" class="weapon-skins-owner__case-image"><span class="weapon-skins-owner__name"></span><a href="" class="ghost ajax-link"></a></div></div>`;
        this.parsedItem = $.parseHTML(this.singleItem);
    }

    add(data) {
        var singleItem = $(this.parsedItem).clone();
        $(singleItem).find(".weapon-skins__image").attr({ src: "/img/" + data.item_src });
        $(singleItem).find(".weapon-skins__quality")
            .attr({ class: "weapon-skins__quality" })
            .addClass("weapon-skins__quality--" + data.class_name);
        $(singleItem).find(".weapon-skins-owner__case-image").attr({ src: "/img/" + data.case_image });
        $(singleItem).find(".weapon-skins-owner__name").html(data.name);
        $(singleItem).find("a.ghost").attr({ href: data.user_id });

        setTimeout(() => {
            $(singleItem).prependTo(".live-drops__inner");
        }, data.now == false ? 0 : data.now);
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
        this.file = this.isDeviceMobile() ? "mobile.css" : "main.css";

        $($("link")[1]).attr({
            href: "/assets/css/" + this.file + "?v=" + this.time
        });

        if (this.isDeviceMobile()) {
            this.if = true;
            $($(".social-row")[0]).remove();
            $(".topbar-profile__balance, .stndfspin-features, .profile-confirmation, .profile-info").removeClass("skewed-element");
            $(".topbar-menu, .social-row__title").remove();
            $(".bottombar").after($(".bottombar__description"));
            $(".lastbar").after($(".bottombar-menu"));
            $(".stndfspin-features__options").after($(".topbar-language"));
        } else this.if = false;
    }

    isDeviceMobile() {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            return true;
        } else return false;
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
}

class STNDFItems {
    static gather(parent) {
        var ItemsArray = [];
        $(parent).find(".sorted-skins__unit").each(function () {
            ItemsArray.push({
                weapon_id: $(this).attr("data-id"),
            });
        });
        return ItemsArray;
    }
}

// Controllers

class ItemsController extends STNDFItems {
    static sell(weapon_id, callback) {
        api.post("/item/sell", { id: weapon_id }, callback);
    }

    static sellAll() {
        api.post("/item/sellall", { }, (result) => {
            page.popup.close();
            page.support.refresh();
            DOM.update("required-update", {
                balance: split_number(result.balance) + " Р"
            });
            page.support.notify("success", "Предметы успешно проданы");
        });
    }

    static createWithdrawal(params) {
        api.post("/item/sell", params, this.callback);
    }

    static callback(result) {
        page.support.notify("success", getLanguage(result.success_message));
    }

    static RemoveItem(weapon_id) {
        $("[weapon-id='" + weapon_id + "'], [data-id='" + weapon_id + "']").remove();
    }

    static CreateItem() {
        var clone = $(sorted_skin_html).clone();
        this.items = [clone];
    }

    static CreateContract() {
        this.CreateItem();
        var clone = $(sorted_contract_html).clone().prepend(this.items.last());
        this.contracts = [clone];
    }

    static ModifyItemByData(params = {}) {
        this.items.last(function ($this) {
            $this.find(".sorted-skins__cost").html(alter_by_currency(params.price, true));
            $this.find(".sorted-skins__skin-title--0").html(params.name);
            $this.find(".sorted-skins__skin-title--1").html(params.subname);
            $this.find(".weapon-skins__image:only-child").attr({ src: "/img/" + params.image });
            $this.addClass("sorted-skins__unit--" + params.class_name);
        });
    }

    static ModifyContractByData(params = {}) {
        this.ModifyItemByData(params.win);
        this.contracts.last(($this) => {
            params.item_list.filter((weapon) => {
                $this.find(".sorted-cotracts__skins").append(this.CreateWeapon(weapon.item));
            });
            $this.find(".sorted-cotracts__text span").html(alter_by_currency(params.price, true, true));
            $this.find(".sorted-skins__unit").replaceWith(this.items.last());
        });
    }

    static AppendItemTo(object) {
        var item = this.items.last();
        $(item).appendTo(object);
    }

    static AppendItemAfter(object) {
        var item = this.items.last();
        $(item).insertAfter(object);
    }

    static AppendContractTo(object) {
        var сontract = this.contracts.last();
        $(сontract).appendTo(object);
    }

    static CreateWeapon(params = {}) {
        return `<div class="weapon-skins__weapon"><img src="${"/img/" + params.image}" class="weapon-skins__image"><span class="weapon-skins__quality weapon-skins__quality--${params.class_name}"></span></div>`;
    }
}

class FortuneWheelController {
    static setInnerPrice(wheel_id, price) {
        $(".fortune-wheel[data-id='" + wheel_id + "'] .js-wheel-item-price").html(alter_by_currency(price, true))
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
        console.warn("Function error prevented: " + error);
    }
}

async function __wait(seconds, $function) {
    await $function();
    await setTimeout(() => { }, seconds);
}

function split_number(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function alter_by_currency(param, appendCurrency = false, toFixed = false) {
    var multiplier = getLanguage('settings.multiplier');
    var number = (param * multiplier);
    if (toFixed) number = number.toFixed(2);

    return appendCurrency ? (number + ' ' + getLanguage('settings.currency')) : number;
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