// Handlers

page.setup({
    AutoScrollOffset: -2.5, // 2.5em
    ReferalLoadByElement: 6,
    ReferalCurrentTablePage: 0,
});

// DOM Listening for LiveFeed Change

DOM.listen(".live-drops__inner", (type, element) => {
    if (type != "childList") return;
    var length = $(element).find(".weapon-skins__weapon").length;
    if (length > 25) page.liveFeed.removeLast();
});

DOM.listen(page.support.fickle, type => {
    if (type != "childList") return;
    // Clear variables
    button_more = {
        contracts: 1,
        inventory: 1,
        history: 1,
        battles: 1,
    };
    page.support.context(function () {
        // After page is loaded
        this.onPageLoaded(this.pageLoaded[1]);
        this.EventPageLoaded(this.pageLoaded);
        if (this.hash) this.startActionOnLoaded();
        prevent_error_function(() => {
            this.ScrollInspector[this.pageLoaded[1]]();
        });
        this.pageLoading.resolve();
        // ...Mobile
        if (page.mobile.if) this.EventPageLoaded(this.pageLoaded, "mobile");
    });
    ProgressBar.end();
});

// Socket

(function () {
    const socket = io('/', {
        reconnectionDelay: 10
    });

    socket.on('standoffspin:App\\Events\\LiveEvent', async (data) => {
        var action = data.result.action;
        delete data.result.action;
        var result = data.result;
        switch (action) {
            case "online":
                DOM.update("socket-update", result, true);
                break;

            case "bonus_update":
                DOM.update("bonus-update--" + result.bonus_id, result, true);
                break;

            case "livedrop":
                var sample = result.items[0];
                if ("case_id" in sample ? sample["case_id"] : $(".battle").data("id") == page.support.pageLoaded[2]) {
                    await page.wheel.promise.promise;
                }
                result.items.filter(function (item) {
                    page.liveFeed.CreateByData(item);
                    page.liveFeed.AddToFeed();
                });
                break;

            case "battle_join":
                await page.support.pageLoading.promise; // Wait for page is loaded
                
                if ((result.owner_id == ServiceController.userId || result.rival_id == ServiceController.userId) && result.battle_id == page.support.pageLoaded[2]) {
                    FortuneWheelController.BattleInit();
                    FortuneWheelController.BattleCry(result.itemList, result.wheelWinnerId);
                    page.support.actionOnLoaded["battle_hide_all"]();
                    $(".fortune-wheel--right .fortune-wheel-user__image").attr({ src: result.user.photo });
                    $(".fortune-wheel--right .fortune-wheel-user__nickname").html(result.user.first_name + " " + result.user.last_name);
                }
                break;

            case "battle_create":
                if (ServiceController.userId == 0) return;
                $(`tr[data-id="${result.case_id}"] .battles-table__buttons`).prepend(`<button class="battles-table__button battles-table__button--green skewed-element js-battle-join">Войти</button>`);
                break;
        }
    });
})();

(function () {
    page.lang.tap = $(".topbar-language__text").html();
    $(".topbar-language__icon").css({
        "background-image": `url(${page.lang.path + page.lang.tap + ".png"})`,
    });
    if (!page.mobile.if) {
        $($("link")[2]).attr({
            href: "/assets/css/main.css?v=" + page.mobile.time
        });
    }
    ServiceController.MinWithdrawalPrice = 25;
})();

// Language

page.lang.onclick = function (tap) {
    api.post("/language/set/" + tap, {}, function () {
        window.location.reload();
    });
};

// Pages

// When any pages are loaded 
page.support.onPageLoaded = function (url) {
    if (ServiceController.userId != 0) {
        api.post("/user/update");
        api.get("/user/notifications", {}, async (result) => {
            for (var i = 0; i < result.length; i++) {
                await page.popup.closed.promise;
                var notify = result[i];
                var notify_data = JSON.parse(notify.data);
                page.popup.open(notify_data.popup, notify_data.data);
            }
        });
    }
    if (typeof page.wheel.promise.status == "pending" && !(url == "case" || url == "battle")) {
        page.wheel.promise.resolve();
    }
    // Preventing Unexpected Scrolling
    if (window.scrollX) $("html, body").scrollLeft(0);
    if (window.scrollY > (5).toPx("body") && page.support.AbleScrollDown) $(".page-part").scrollTo();
    // Clearing
    config.ReferalCurrentTablePage = 0;
    if (page.inspector != undefined) page.inspector.deconstruct();
};

page.mobile.onMobile = function () {
    page.support.DeviceType = "mobile";
    // Layout
    $("#adaptive-style").remove();
    $(".timer-v2__text").remove();
    $($(".social-group")[0]).remove();
    $(".topbar-menu, .social-group__title").remove();
    $(".bottombar").after($(".bottombar__description"));
    $(".lastbar").after($(".bottombar-menu"));
    $(".stndfspin-features__options").after($(".topbar-language"));
    $(".live-drops").after($(".stndfspin-features__stats"));
    $(".mobile-menu").removeClass("hidden");
}

page.support.addPage("/", () => {
    $(".stndfspin-cases__cost[data-time]").timer();
});

page.support.context(function () {
    // Desktop Pages
    this.__addPage({
        page: "/case",
        action: function () {
            ServiceController.SetCurrentService = {
                Name: $(".fortune-wheel__image").html(),
                Price: $(".box").data("price"),
            };
            page.wheel.__init();
            page.wheel.box_input_change($(".box__input[data-id='0']"));
            $(".box__column--1[data-time]").timer();
        },
        errors: {
            403: function () {
                page.popup.open("vk_participation");
            },
        },
    });
    this.__addPage({
        page: "/faq",
        action: function () {
            var faq_content = $(".faq__content");
            faq_content.each(function () {
                $(this).css({ "--height": $(this).find(">").outerHeight() + (2).toPx(faq_content) });
            });
        },
    });
    this.__addPage({
        page: "/lobby",
        action: function () {
            $(".page-part").scrollTo();
        },
    });
    this.__addPage({
        page: "/referal",
        action: function () {
            page.referal.init();
        },
        ScrollInspector: function () {
            if (ServiceController.userId == 0) return;
            page.inspector = this;
            //const StaticInt = (3.2 * 1.15).toPx() + (config.ReferalLoadByElement * (5.2 * 1.15).toPx());
            const ScrollInt = () => {
                try {
                    return $(".table").offset().top + ($(".table").outerHeight() - (2).toPx()) - window.innerHeight;
                } catch (error) {
                    this.deconstruct();
                    console.error(error);
                }
            };
            const newElement = $(".table tr:last-child").clone();
            $(".table tr:last-child").remove();
            this.OnScrollEvent(ScrollInt, function () {
                this.entry = $.Postpone();
                ProgressBar.start();
                api.get(["/user/load/", ServiceController.userId, "/referal/", config.ReferalCurrentTablePage], {}, result => {
                    result.result.filter(function (person, index) {
                        newElement.find("td:nth-child(1)").html(index + (config.ReferalCurrentTablePage * 30) + 1);
                        newElement.find("td:nth-child(2) .table-user__image").attr({ src: person.photo });
                        newElement.find("td:nth-child(2) a").attr({ href: "/profile/" + person.id });
                        newElement.find("td:nth-child(2) span").html(person.first_name + " " + person.last_name);
                        newElement.find("td:nth-child(3)").html(person.ref_balance);
                        newElement.find("td:nth-child(4)").html(person.profit);
                        newElement.clone().appendTo(".table");
                    });
                    if (result.nextPage) {
                        config.ReferalCurrentTablePage++;
                        this.entry.resolve();
                    } else {
                        config.ReferalCurrentTablePage = 0;
                        this.deconstruct();
                    }
                    ProgressBar.end();
                });
            });
        },
    });
    // Mobile Pages
    this.__addPage({
        page: "/profile",
        device: "mobile",
        action: function () {
            $(".profile-info, .profile-confirmation").removeClass("skewed-element");
        },
    });
    this.__addPage({
        page: "/lobby",
        device: "mobile",
        action: function () {
            if (ServiceController.userId == 0) {
                $(".battles-table__buttons").remove();
            }
        },
    });
    this.__addPage({
        page: "/battle",
        device: "mobile",
        action: function () {
            page.wheel.promise = $.post
            $("[class *= 'battle__button']").removeClass("skewed-element");
            $(".page-part").scrollTo();
        },
    });
    this.__addPage({
        page: "/referal",
        device: "mobile",
        action: function () {
            $(".skewed-row__row").removeClass("skewed-element");
        },
    });
});

page.support.addPage("/battle", () => {
    page.wheel.__init();
    if ($(".battle").data("status") == "END") {
        $(".fortune-wheel__skin, .battle__buttons").removeClass("hidden");
    }
});

page.support.addPage("/contracts", () => {
    page.contract.init();
    page.contract.spot.init();
    page.canvas.init();
});

page.support.addPage("/bonuses", () => {
    // Timer
    $("[data-time]").timer(true); // True, если нужны дни
});

page.support.addPage("/profile", () => {
    var a = +$($(".user-level-block__description > b")[0]).html();
    var b = +$($(".user-level-block__description > b")[1]).html();
    var levelPercent = (a / b) * 100;
    ServiceController.LevelProgress(levelPercent);
});

// Probable actions when the page is loaded

page.support.actionOnLoaded["open_tab_battle"] = function () {
    $(".tab-swithcer__button[tab='battles']")
        .click()
        .scrollTo()
};

page.support.actionOnLoaded["go_home"] = async function () {
    await page.support.load("/");
    $("main").scrollTo();
};

page.support.actionOnLoaded["battle_hide_all"] = function () {
    $(".fortune-wheel__skin, .battle__buttons").addClass("hidden");
};

page.support.actionOnLoaded["to_wheel"] = function () {
    $(".fortune-wheel").scrollTo(null);
};

// Wheel Opencase

DOM.on("click", "wheel", {
    reopen: function () {
        // Reload Page
        page.support.refresh();
    },
    "sell-item": function () {
        console.log($(this).attr("weapon-id"));
        
        ItemsController.Sell(this, (result) => {
            // Balance Update
            BalanceController.UpdateBalance(result.balance);
            // Reload Page
            page.support.refresh();
            // Notify
            page.support.notify("success", "Предмет успешно продан");
        });
    },
    "sell-all-items": function () {
        page.wheel.data.current.filter(function (item) {
            // Sell An Item
            ItemsController.Sell(item.id, function (result) {
                // Balance Update
                BalanceController.UpdateBalance(result.balance);
            });
        });
        // Reload Page
        page.support.refresh();
        // Notify
        page.support.notify("success", "Предметы успешно проданы");
    },
});

page.wheel.release = function (fast = false) {
    // if a client is unauthorized, doing nothing
    if (ServiceController.userId == 0) return;
    // Init
    page.wheel.init();
    // API Connection
    api.post("/case/open", {
        id: page.support.pageLoaded[2],
        multiplier: page.wheel.data.multiplier
    }, result => {
        page.wheel.multiple_win(result.itemList, fast);
        // Balance Update
        BalanceController.UpdateBalance(result.balance);
        // Audio
        if (result.sound != null) new Audio(`/assets/sound/${result.sound}`)
    });
}

page.wheel.box_input_change = function (e) {
    // Set Wheel Multiplier
    page.wheel.data.multiplier = page.wheel.data.multiplies[typeof e == "object" ? e.data("id") : 0];
    var case_price = $(".js-wheel-price").data("price");
    var price = page.wheel.data.multiplier * case_price;
    var price = price == NaN ? 0 : price;
    // Update Case Price & Funds Lack
    DOM.update("wheel", {
        price: price ? alter_by_currency(price, true) : getLanguage("case.buttons.free"),
        funds_lack: alter_by_currency(BalanceController.FundsLackAmount(price) * -1, true),
    });
    // Check for sufficient funds
    if (BalanceController.HasSufficientFunds(price)) {
        $(".fortune-wheel__lack-of-funds").addClass("hidden");
        $(".fortune-wheel__buttons").removeAttr("hidden");
    } else {
        $(".fortune-wheel__lack-of-funds").removeClass("hidden");
        $(".fortune-wheel__buttons").attr({ hidden: "" });
    }
    // Check for minimal price threshold
    if (!BalanceController.HasSufficientFunds()) $(".box__multiply").addClass("hidden");
}

$(document).on("click", ".box__input", function () {
    $(".box__input").removeClass("box__input--active");
    $(this).addClass("box__input--active");
    page.wheel.box_input_change($(this));
});

$(document).on("click", ".box__view .fortune-wheel__button--0:not([class *= 'js'])", () => {
    page.wheel.release(false)
});

$(document).on("click", ".box__view .fortune-wheel__button--1:not([class *= 'js'])", () => {
    page.wheel.release(true)
});

// Bonuses

$(document).on("click", ".feeder[data-id] .feeder__button:not([disabled])", function () {
    $(this).each(function () {
        api.post("/bonus/request", {
            id: +$(this).parent().attr("data-id"),
        }, (result) => {
            $(this).val(result.success_message)
        });
    });
});

DOM.on("click", "bonus", {
    "balance-button": function () {
        api.post("/promo/prize_promo", {
            promo: $(".js-bonus-balance-gap").val(),
        }, (result) => {
            page.support.notify("success", result.success_message)
        });
    },
});

// Referal
DOM.on("click", "referal", {
    "active-button": function () {
        api.post("/referal/active", {
            code: $(".js-referal-active-gap").val(),
        }, (result) => {
            page.support.notify("success", result.success_message)
        });
    },
    "save-button": function () {
        api.post("/referal/save", {
            code: $(".js-referal-save-gap").val(),
        }, (result) => {
            page.support.notify("success", result.success_message)
        });
    },
});

// FAQ
$(document).on("click", ".faq__summary", function () {
    const clause = $(this).parent();
    $(".faq__clause").not(clause).removeClass("faq__clause--deployed");
    clause.toggleClass("faq__clause--deployed");
});

// Item Events

DOM.on("click", "item", {
    withdraw: function () {
        // Vars
        var weapon = $(this).parent().parent().parent();
        var weapon_id = weapon.data("id");
        var weapon_price = alter_by_currency(weapon.find(".sorted-skins__cost").html(), false);
        // Conditions
        if (page.popup.tmp.NeedsToSetAvatar) {
            page.popup.open("withdraw__avatar");
            return;
        }
        if (weapon_price < ServiceController.MinWithdrawalPrice) {
            page.popup.open("withdraw__error");
            return;
        }
        // Final Action
        page.popup.open("withdraw", {
            item: {
                id: weapon_id,
                object: weapon,
                price: (+Math.random() + (weapon_price / 0.2)).toFixed(2),
                initial_price: weapon_price,
            },
        });
    },
    "withdraw-submit": function () {
        var item = page.popup.tmp.options.item;
        $(".popup-window__button").attr({ disabled: "" });
        ProgressBar.start();
        ItemsController.CreateWithdrawal({
            item: item.id,
            price: item.price - item.initial_price,
            name: DOM.$("item", "withdraw-input").val(),
        }, function () {
            const obj = DOM.$("tab", "history");
            item.object.find(".js-item-sell").remove();
            item.object.find(".sorted-skins__icon--arrow").removeClass("sorted-skins__icon--arrow").addClass("sorted-skins__icon--refresh");
            item.object.find(".sorted-skins__icon").removeClass("js-item-sell js-item-withdraw");
            item.object.prependTo(obj);
            ItemsController.Callback();
            page.popup.close();
            ProgressBar.end();
        });
    },
    sell: function () {
        var weapon = $(this).parent().parent().parent();
        var weapon_id = weapon.data("id");
        var weapon_price = alter_by_currency(weapon.find(".sorted-skins__cost").html(), false);
        page.popup.open("sell", {
            item: {
                id: weapon_id,
                object: weapon,
                price: weapon_price,
            },
        });
    },
    sell_submit: function () {
        var item = page.popup.tmp.options.item;
        $(".popup-window__button").attr({ disabled: "" });
        ProgressBar.start();
        ItemsController.Sell(item.id, function () {
            const obj = DOM.$("tab", "history");
            item.object.find(".js-item-withdraw").remove();
            item.object.find(".sorted-skins__icon").removeClass("js-item-sell js-item-withdraw");
            item.object.prependTo(obj);
            ItemsController.Callback();
            page.popup.close();
            ProgressBar.end();
        });
    },
});

// Profile

$(document).on("click", ".tab-swithcer__button[tab]:not(.tab-swithcer__button--only)", function () {
    // Switching Active Button
    $(".tab-swithcer__button").removeClass("tab-swithcer__button--active");
    var tab = $(this).addClass("tab-swithcer__button--active").attr("tab");
    // Switching Tab
    $("[class *= 'js-tab-']").addClass("hidden");
    $("[class *= 'js-tab-" + tab + "']").removeClass("hidden");
});

$(document).on("click", ".tab-swithcer__button--only[tab]", function () {
    $(this).toggleClass("tab-swithcer__button--active");
    $("[class *= 'js-tab-']").toggleClass("hidden");
});

DOM.click(".tab-swithcer__button--active[onreclick]", function () {
    eval($(this).attr("onreclick"));
});

$(document).on("click", ".sorted-skins-more-button", function () {
    var item = $(this).parent();
    var sorted = item.attr("class");
    var config = item.data("config") != undefined ? item.data("config") : {};
    var classes = sorted.split(" ");
    var sorted_specified = classes[2].replace("js-tab-", "");
    var page_id = button_more[sorted_specified];
    var type = {
        contracts: "contracts",
        inventory: "inventory",
        history: "history_inventory",
        battles: "battles",
    }[sorted_specified];

    api.get(["/user/load/", page.support.pageLoaded[2], type, page_id], {}, result => {
        if (result.nextPage == false) {
            $(this).parent().find(".sorted-skins-more-button").addClass("hidden");
        }
        switch (type) {
            case "contracts":
                result.result.filter(function (data) {
                    ItemsController.CreateContract({ icons: false });
                    ItemsController.ModifyContractByData(data);
                    ItemsController.AppendContractTo(".js-tab-" + sorted_specified);
                });
                break;
            case "battles":
                result.result.filter(function (data) {
                    ItemsController.CreateBattle(config);
                    ItemsController.ModifyBattleByData(data);
                    ItemsController.AppendBattleTo(".js-tab-" + sorted_specified);
                });
                break;
            default:
                if (sorted_specified == "history") config = { events: false };
                result.result.filter(function (data) {
                    ItemsController.CreateItem(config);
                    ItemsController.ModifyItemByData(data);
                    ItemsController.AppendItemTo(".js-tab-" + sorted_specified);
                });
                break;
        }
        // Button More
        button_more[sorted_specified]++;
    });
});

// Skins

$(document).on("click", ".sorted-skins .sorted-skins__unit[pickable]", function () {
    $(this).attr({ pickable: "Убрать" });
    page.contract.spot.takePlace($(this));
    page.contract.update_DOM();
});

$(document).on("click", ".contract__spot .sorted-skins__unit[pickable]", function () {
    $(this).attr({ pickable: "Выбрать" });
    page.contract.spot.freeUpPlace($(this));
    page.contract.update_DOM();
});

// Contract

$(document).on("click", ".contract-window__button", function () {
    var items = [];
    page.contract.spot.spots.filter(function (spot) {
        items.push(spot.data.weapon_id);
    });
    ProgressBar.start();
    // API Connection
    api.post("/contract/create", {
        items: items
    }, async function (result) {
        var gap = {
            0: result.item.name + " | " + result.item.subname,
            1: result.item.price + " Р",
        }
        // Fill the gaps
        $(".contract-result__input").each((i, e) => $(e).val(gap[i]));
        // Resolve the promise
        page.contract.promise.resolve();
        // Progress
        ProgressBar.end();
        // Closing Popup Window
        page.popup.close();
        await page.popup.closed.promise;
        // Hidding Contract Disposal
        $(".contract__disposal, .contract__flex, .contract__caution").addClass("hidden");
        $(".fortune-wheel__buttons").removeClass("hidden");
        $(".fortune-wheel__button--1").attr({ "weapon-id": result.item.id });
        DOM.$("contract", "item_price").html(alter_by_currency(result.item.price, true));
        // Creating Item
        ItemsController.CreateItem();
        ItemsController.ModifyItemByData(result);
        ItemsController.PrependItemTo($(".contract"));
        $(".page-part").scrollTo();
    });
});

// Battles

DOM.on("click", "battle", {
    join: function () {
        if (ServiceController.userId == 0) {
            page.popup.open("auth");
            return;
        }
        var lobby_id = $(this).parent().parent().parent().data("id");
        api.post("/battle/join", { id: lobby_id }, function (result) {
            // Load the page
            page.support.load(result.redirectURL, "battle_hide_all");
        });
        page.support.pageLoading = $.Postpone();
    },

    create: function () {
        var lobby_id = $(this).parent().parent().parent().data("id");
        api.post("/battle/create", { id: lobby_id }, function (result) {
            page.support.load(result.redirectURL);
        });
    },
});

// Top Up

$(document).on("click", ".top-up__button", function () {
    api.post("/payment/create", {
        sum: $(".top-up__text").val(),
        promo: $(".promocode__input").val(),
    }, function (result) {
        window.location.href = result.redirectURL;
    });
});

$(document).on("keyup", ".promocode__input", function () {
    api.post("/promo/promo", {
        promo: $(".promocode__input").val(),
    }, function (result) {
        if ("error_msg" in result) {
            $(".promocode__text").html(getLanguage(result.error_msg));
        } else {
            $(".promocode__text").html("Бонус к пополнению " + result.percent + "%");
        }
    });
});

// Level

DOM.on("click", "level", {
    upgrade: function () {
        api.post("/user/upgradeLevel", {}, function (result) {
            if (result.nextLevel) {
                ServiceController.LevelProgress(0);
                $(".page-part__title").html(result.lvl + " Уровень");
                $(".user-level-block__circle--number, .topbar-profile__avatar--lvl > span").html(result.lvl);
                $(".user-level-block").each(function (i) {
                    switch (i) {
                        case 0:
                            $(this).find(".user-level-block__description > b").html(0);
                            break;
                        case 1:
                            $(this).find(".user-level-block__description > b").html(result.nextLevel.exp);
                            $(this).find(".user-level-block__circle--image").attr({ src: "/img/" + result.nextLevel.case.image });
                            break;
                    }
                });
                setTimeout(async () => {
                    await page.support.pageLoading.promise;
                    page.support.actionOnLoaded["go_home"]();
                    $(".page-part:first-child").css({ animation: "1s emphasize cubic-beizer(0.5, 0, 0.75, 0.5)" });
                }, 500);
            }
        });
    },
});

// Filter

DOM.on("click", "filter", {
    button: function () {
        var current = $(".tab-swithcer__button--active");
        new filter(".js-tab-" + current.attr("tab")), 
        filter.exclude({
            price: {
                min: 25,
                max: 9999,
            },
        });
    },
});

// Referal

DOM.on("click", "referal", {
    save: function () {
        var promo = DOM.$("referal", "me_gap").val();
        api.post("/referal/save", { code: promo }, result => {
            page.support.notify("success", result.error_msg)
        });
    },
    activate: function () {
        var promo = DOM.$("referal", "your_gap").val();
        api.post("/referal/active", { code: promo }, (result) => {
            BalanceController.UpdateBalance(result.balance);
            $(this).attr({ disabled: "" });
            page.support.notify("success", "Заебок");
        });
    },
    copyMe: function () {
        var id = $(this).attr("for");
        var target = $("#" + id);
        target.css({ "text-transform": "lowercase" });
        if (target.is("[disabled]")) {
            target.removeAttr("disabled");
            target[0].select();
            document.execCommand('copy');
            target.attr({ disabled: "" });
        } else {
            target[0].select();
            document.execCommand('copy');
        }
        target.css({ "text-transform": "" });
    },
});

// Popup

page.popup.on["withdraw"] = function (options) {
    // CLear Styles Option
    if (this.summary.search("!clearStyles") != -1) {
        this.summary = this.summary.replace("!clearStyles", "");
        $(".popup-window__summary").addClass("popup-window__summary--clear-styles");
    }
    // Vars
    var itemPrice = options.item.price;
    this.tmp.options = options;
    // Editing
    this.wEdit({
        summary: this.summary.replace('{price}', options.item.price),
        content: `<div style="display:flex;justify-content:center;flex-direction:column;align-items:center;"><input class="popup-window__button button1 js-item-withdraw-input" withdraw-skin placeholder="${this.wText("other.placeholder")}"><button class="popup-window__button button1 js-item-withdraw-submit">${this.wText("other.button")}</button></div>`,
    });
};

page.popup.on["withdraw__error"] = function () {
    // Automataticly Filled
};

page.popup.on["withdraw__cancel"] = function (options) {
    this.wEdit({
        summary: this.summary.replace('{skin}', options.skin),
    });
};

page.popup.on["withdraw__avatar"] = function () {
    this.wEdit({
        content: "<form class='avatar-change' method='POST' enctype='multipart/form-data' action='/api/v1/user/avatar_update'><div class='avatar-change__title'>" + this.wText("avatar_change__title") + "</div><img src='/img/guest.png' class='avatar-change__avatar' onerror='img_error(this, true)'><label class='avatar-change__input skewed-element' for='avatar_image'>" + this.wText("avatar_change__input") + "</label><input id='avatar_image' accept='.jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*' type='file' onchange='this.form.submit();' name='file' style='display: none; position: absolute;'>" + `<input type="hidden" name="_token" value="${api.token}"></form>`,
    });
};

page.popup.on["auth"] = function () {
    this.wEdit({
        content: '<div class="auth"><a href="/auth/vk" class="auth__button auth__button--vkontakte">Вконтакте</a><a href="/auth/twitch" class="auth__button auth__button--twitch">Twitch</a><a href="/auth/youtube" class="auth__button auth__button--youtube">Youtube</a></div>',
    });
};

page.popup.on["sell"] = function (options) {
    this.tmp.options = options;
    this.wEdit({
        summary: this.summary.ias("price", options.item.price),
        content: `<div style="display:flex;justify-content:center;"><button class="popup-window__button button1 js-item-sell_submit">${this.wText("buttons.yes")}</button><button class="popup-window__button button2" onclick="page.popup.close();">${this.wText("buttons.no")}</button></div>`,
    });
};

page.popup.on["sell_all"] = function (options) {
    this.wEdit({
        summary: this.summary.replace("{price}", options.inventoryPrice),
        content: `<div style="display:flex;justify-content:center;"><button class="popup-window__button button1" onclick="ItemsController.sellAll();">${this.wText("buttons.yes")}</button><button class="popup-window__button button2" onclick="page.popup.close();">${this.wText("buttons.no")}</button></div>`,
    });
};

page.popup.on["sell_all_error"] = function () {
    // Automataticly Filled
};

page.popup.on["top_up"] = function (options) {
    this.wEdit({
        content: `<div class="top-up">
                        <div class="promocode">
                            <input type="text" class="promocode__input" placeholder="${this.wText("promocode__input")}">
                            <span class="promocode__text">${this.wText("promocode__text")}</span>
                        </div>
                        <div class="top-up__row">
                            <input type="text" class="top-up__text" value="100">
                            <input type="submit" class="top-up__button" value="${this.wText("top_up_btn")}">
                        </div>
                    </div>`,
        help: '<div class="paysys paysys--1"><img src="https://standoffcase.ru/assets/img/payments_systems/mastercard.svg" class="paysys__image"><img src="https://standoffcase.ru/assets/img/payments_systems/webmoney.svg" class="paysys__image"><img src="https://standoffcase.ru/assets/img/payments_systems/qiwi.svg" class="paysys__image"><img src="https://standoffcase.ru/assets/img/payments_systems/yandex.svg" class="paysys__image"><img src="https://standoffcase.ru/assets/img/payments_systems/visa.svg" class="paysys__image"></div>',
    });
    $(".popup-window__top-up--big-input").on('input', function () {
        var value = $(this).val();
        if (value == "") {
            $(".top_up_text").text(this.wText("promocode.default"));
            return;
        }
        api.get("/user/promo", { name: value }, function () {
            if (data.percent) {
                $(".top_up_text").text(this.wText("promocode.percent").replace("{percent}", data.percent));
            } else {
                $(".top_up_text").text(this.wText("promocode.not_found"));
            }
        });
    });
};

page.popup.on["vk_participation"] = function (options) {
    this.wEdit({
        content: '<div class="vk-accept"> <section> <div class="vk-accept__title">' + this.wText("sections.1") + '</div> <div class="vk-accept__content"> <div class="mauto" id="vk_groups"></div> </div> </section> <section> <div class="vk-accept__title">' + this.wText("sections.2") + '</div> <div class="vk-accept__content"> <div class="mauto width150" id="vk_allow_messages_from_community"></div> </div> </section> <section> <div class="vk-accept__title">' + this.wText("sections.3") + '</div></section> <button onclick="page.popup.close()" class="popup-window__button button1">' + this.wText("button") + '</button> </div>',
    });

    // VK Widgets
    VK.Widgets.AllowMessagesFromCommunity("vk_allow_messages_from_community", { height: 30 }, 190286598);
    VK.Widgets.Group("vk_groups", { mode: 1, no_cover: 1 }, 190286598);
};

$(document).on("click", ".popup-window__close, .popup__cover", () => {
    page.popup.close();
});