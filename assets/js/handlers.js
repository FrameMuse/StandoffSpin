// Handlers

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
    }
    // After page is loaded
    page.support.onPageLoaded(page.support.pageLoaded);
    // Run sciprts from loaded page & Prevent Unexpected Errors
    prevent_error_function(features_toLoad);
    page.support.progress = 100;
    setTimeout(() => {
        page.support.progress = null;
    }, 282.5);
});

// Socket

(function () {
    const socket = io('/', {
        reconnectionDelay: 10
    });

    socket.on('standoffspin:App\\Events\\LiveEvent', (data) => {
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
                result.items.filter(function (item) {
                    page.liveFeed.add(item);
                });
                break;
        }
    });
})();

(function () {
    setInterval(() => {
        api.post("/user/update");
    }, 270000);
})();

(function () {
    page.lang.tap = $(".topbar-language__text").html();
    $(".topbar-language__icon").css({
        "background-image": `url(${page.lang.path + page.lang.tap + ".png"})`,
    });
})();

// Language

page.lang.onclick = function (tap) {
    api.post("/language/set/" + tap, {}, function () {
        window.location.reload();
    });
};

// Pages

page.support.addPage("/profile", () => {
    if (page.mobile.if) {
        $(".profile-info, .profile-confirmation").removeClass("skewed-element");
    }
});

page.support.addPage("/case", () => {
    page.wheel.reject = true;
    page.wheel.count(12);
});

page.support.addPage("/battle", () => {
    page.wheel.reject = true;
    page.wheel.count(12);
});

page.support.addPage("/contracts", () => {
    page.contract.init();
    page.contract.spot.init();
    page.canvas.init();
});

page.support.addPage("/referal", () => {
    page.referal.init();
});

page.support.addPage("/bonuses", () => {
    // Timer
    $("[data-time]").timer(false); // True, если нужны дни
});

// Wheel Opencase

DOM.on("click", "wheel", {
    reopen: function () {
        // Restart page
        page.support.load(window.location.pathname);
    },
    "sell-item": function () {
        ItemsController.sell($(this).attr("weapon-id"), (result) => {
            // Balance Update
            DOM.update("required-update", {
                balance: split_number(result.balance) + " Р"
            });
            // Reload Page
            page.support.refresh();
            // Notify
            page.support.notify("success", "Предметы успешно проданы");
        });
    },
    "sell-all-items": function () {
        page.wheel.data.current.filter(function (item) {
            ItemsController.sell(item.id, () => { });
        });
        page.support.notify("success", "Предметы успешно проданы");
    },
});

$(document).on("click", ".box__input", function () {
    $(".box__input").removeClass("box__input--active");
    $(this).addClass("box__input--active");
});

page.wheel.release = function (fast = false) {
    // Init
    page.wheel.init();
    // API Connection
    api.post("/case/open", {
        id: page.support.pageLoaded[2],
        multiplier: page.wheel.data.multiplier
    }, result => {
        page.wheel.multiple_win(result.itemList, fast);
        // Balance Update
        DOM.update("required-update", {
            balance: split_number(result.balance) + " Р"
        });
        // Audio
        if (result.sound != null) new Audio(`/assets/sound/${result.sound}`)
    });
};

$(document).on("click", ".box__view .fortune-wheel__button--0:not([class *= 'js'])", () => {
    page.wheel.release(true)
});
$(document).on("click", ".box__view .fortune-wheel__button--1:not([class *= 'js'])", () => {
    page.wheel.release(false)
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
    $(this).parent().toggleClass("faq__clause--deployed");
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

$(document).on("click", ".sorted-skins-more-button", function () {
    var sorted = $(this).parent().attr("class");
    var classes = sorted.split(" ");
    var sorted_specified = classes[2].replace("js-tab-", "");
    var page_id = button_more[sorted_specified];
    var type = {
        contracts: "contracts",
        inventory: "inventory",
        history: "history_inventory",
    }[sorted_specified];

    api.get("/user/load/" + page.support.pageLoaded[2] + "/" + type + "/" + page_id, { }, result => {
        if (result.nextPage == false) {
            $(this).parent().find(".sorted-skins-more-button").addClass("hidden");
        }
        switch (type) {
            case "contracts":
                result.result.filter(function (data) {
                    ItemsController.CreateContract();
                    ItemsController.ModifyContractByData(data);
                    ItemsController.AppendContractTo(".js-tab-" + sorted_specified);
                });
                break;
        
            default:
                result.result.filter(function (data) {
                    ItemsController.CreateItem();
                    ItemsController.ModifyItemByData(data.item);
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
    page.contract.spot.takePlace($(this));
    page.contract.update_DOM();
});

$(document).on("click", ".contract__spot .sorted-skins__unit[pickable]", function () {
    page.contract.spot.freeUpPlace($(this));
    page.contract.update_DOM();
});

// Contract

$(document).on("click", ".contract-window__button", function () {
    var items = [];
    page.contract.spot.spots.filter(function (spot) {
        items.push(spot.data.weapon_id);
    });
    // API Connection
    api.post("/contract/create", {
        items: items
    }, function (result) {
        var gap = {
            0: result.item.name + " | " + result.item.subname,
            1: result.item.price + " Р",
        }
        // Fill the gaps
        $(".contract-result__input").each(function (i, e) {
            $(e).val(gap[i]);
        });
        // Reset contract
        page.support.refresh();
    });
});

// Popup

page.popup.on["withdraw"] = function (options) {
    var itemPrice = convert(parseFloat(options.item.price) + parseFloat(options.rnd));
    var item = options.item;
    this.wEdit({
        summary: this.summary.replace('{itemPrice}', itemPrice),
        content: `<div style="display:flex;justify-content:center;flex-direction:column;align-items:center;"><input class="popup-window__button button1" withdraw-skin placeholder="${this.wText("other.placeholder")}"><button class="popup-window__button button2" onclick="withdrawConfirm(${item.id}, ${options.rnd})">${this.wText("other.button")}</button></div>`,
    });
};

page.popup.on["withdraw_error"] = function () {
    // Automataticly Filled
};

page.popup.on["withdraw_avatar"] = function () {
    this.wEdit({
        content: "<form class='avatar-change' method='POST' enctype='multipart/form-data' action='/api/v1/user/avatar'><div class='avatar-change__title'>" + getLanguage("popup.withdraw_avatar.avatar_change__title") + "</div><img src='/img/guest.png' class='avatar-change__avatar'><label><a class='avatar-change__input button1'>" + getLanguage("popup.withdraw_avatar.avatar_change__input") + "</a><input accept='.jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*' type='file' onchange='this.form.submit();' name='file' style='display: none; position: absolute;' ></label></form>",
    });
};

page.popup.on["auth"] = function () {
    this.wEdit({
        content: '<div class="auth"><a href="/auth/vk" class="auth__button auth__button--vkontakte">Вконтакте</a><a href="/auth/twitch" class="auth__button auth__button--twitch">Twitch</a><a href="/auth/youtube" class="auth__button auth__button--youtube">Youtube</a></div>',
        help: this.wText("help"),
    });
};

page.popup.on["sell_all"] = function (options) {
    this.wEdit({
        summary: this.summary.replace("{price}", options.inventoryPrice),
        content: `<div style="display:flex;justify-content:center;"><button class="popup-window__button button2" onclick="page.popup.close();">${this.wText("buttons.no")}</button><button class="popup-window__button button1" onclick="ItemsController.sellAll();">${this.wText("buttons.yes")}</button></div>`,
    });
};

page.popup.on["sell_all_error"] = function () {
    // Automataticly Filled
};

page.popup.on["0ge"] = function (options) {
    this.wEdit({
        summary: this.summary.replace("{skin}", options.skin),
    });
};

page.popup.on["top_up"] = function (options) {
    this.wEdit({
        // title: "Пополнение баланса",
        // summary: "Для пополнения баланса вы будете перемещены на сайт платёжной системы",
        content: `<div class="top-up">
                            <div class="promocode">
                                <input type="text" class="promocode__input" placeholder="Промокод">
                                <span class="promocode__text">Если у вас есть промокод введите выше</span>
                            </div>
                            <div class="top-up__row">
                                <input type="text" class="top-up__text" value="100">
                                <input type="submit" class="top-up__button" value="Пополнить">
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

page.popup.on["vk-accept"] = function (options) {
    this.wEdit({
        content: '<div class="vk-accept"> <section> <div class="vk-accept__title">' + this.wText("sections.1") + '</div> <div class="vk-accept__content"> <div class="mauto" id="vk_groups"></div> </div> </section> <section> <div class="vk-accept__title">' + this.wText("sections.2") + '</div> <div class="vk-accept__content"> <div class="mauto width150" id="vk_allow_messages_from_community"></div> </div> </section> <section> <div class="vk-accept__title">' + this.wText("sections.3") + '</div></section> <button onclick="_closePopup()" class="button1">' + this.wText("button") + '</button> </div>',
    });

    // VK Widgets
    VK.Widgets.AllowMessagesFromCommunity("vk_allow_messages_from_community", { height: 30 }, 187346506);
    VK.Widgets.Group("vk_groups", { mode: 1, no_cover: 1 }, 187346506);
};

page.popup.on["pay_confirm"] = function (options) {
    this.wEdit({
        content: `<div style="display:flex;justify-content:center;"><button class="popup-window__button button2" onclick="${options.callback1}">${this.wText("buttons.yes")}</button><button class="popup-window__button button1" onclick="${options.callback2}">${this.wText("buttons.no")}</button></div>`,
    });
};

$(document).on("click", ".popup-window__close, .popup__cover", () => {
    page.popup.fadeOut();
});