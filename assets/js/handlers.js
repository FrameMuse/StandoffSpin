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
        contracts: 0,
        inventory: 0,
        history: 0,
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
})();

// Language

page.lang.onclick = function (tap) {
    api.post("/language/set/" + tap, {}, function () {
        window.location.reload();
    });
};

// Pages

page.support.addPage("/profile", (uri) => {
    api.get("/user/load/" + uri + "/inventory/0", {}, function (result) {
        result.result.filter(function (data) {
            var item = data.item,
                skin = sorted_skin_html.clone();
            $(skin).addClass("sorted-cotracts__unit--" + item.class_name);
            $(skin).find(".sorted-skins__cost").html(item.price);
            $(skin).find(".sorted-skins__skin-title--0").html(item.name);
            $(skin).find(".sorted-skins__skin-title--1").html(item.subname);
            $(skin).find(".weapon-skins__image").src("/img/" + item.image);
            $(".js-tab-inventory").append(skin);
        });
    });

    api.get("/user/load/" + uri + "/contracts/0", {}, function (result) {
        result.result.filter(function (data) {
            var item = data.item,
                skin = sorted_skin_html.clone();
            $(skin).addClass("sorted-cotracts__unit--" + item.class_name);
            $(skin).find(".sorted-skins__cost").html(item.price);
            $(skin).find(".sorted-skins__skin-title--0").html(item.name);
            $(skin).find(".sorted-skins__skin-title--1").html(item.subname);
            $(skin).find(".weapon-skins__image").src("/img/" + item.image);
            $(".js-tab-contracts").append(skin);
        });
    });

    api.get("/user/load/" + uri + "/history_inventory/0", {}, function (result) {
        result.result.filter(function (data) {
            var item = data.item,
                skin = sorted_skin_html.clone();
            $(skin).addClass("sorted-cotracts__unit--" + item.class_name);
            $(skin).find(".sorted-skins__cost").html(item.price);
            $(skin).find(".sorted-skins__skin-title--0").html(item.name);
            $(skin).find(".sorted-skins__skin-title--1").html(item.subname);
            $(skin).find(".weapon-skins__image").src("/img/" + item.image);
            $(".js-tab-history").append(skin);
        });
    });
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

page.wheel.reopen.onclick = function () {
    page.support.load(window.location.pathname);
};

page.wheel.release = function (fast = false) {
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

$(document).on("click", ".box__view .fortune-wheel__button--0", () => {
    page.wheel.release(true)
});
$(document).on("click", ".box__view .fortune-wheel__button--1", () => {
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

$(document).on("click", ".js-bonus-balance-button", function () {
    api.post("/promo/prize_promo", {
        promo: $(".js-bonus-balance-gap").val(),
    }, (result) => {
        page.support.notify("success", result.success_message)
    });
});

// Referal

$(document).on("click", ".js-referal-active-button", function () {
    api.post("/referal/active", {
        code: $(".js-referal-active-gap").val(),
    }, (result) => {
        page.support.notify("success", result.success_message)
    });
});

$(document).on("click", ".js-referal-save-button", function () {
    api.post("/referal/save", {
        code: $(".js-referal-save-gap").val(),
    }, (result) => {
        page.support.notify("success", result.success_message)
    });
});

// FAQ

$(document).on("click", ".faq__summary", function () {
    $(this).parent().toggleClass("faq__clause--deployed");
});

// Profile

$(document).on("click", ".tab-swithcer__button", function () {
    // Switching Active Button
    $(".tab-swithcer__button").removeClass("tab-swithcer__button--active");
    var tab = $(this).addClass("tab-swithcer__button--active").attr("tab");
    // Switching Tab
    $("[class *= 'js-tab-']").addClass("hidden");
    $("[class *= 'js-tab-" + tab + "']").removeClass("hidden");
});

$(document).on("click", ".sorted-skins-more-button", function () {
    var _sorted_ = $(this).parent().find(".weapon-skins");
    var classes = _sorted_.attr("class").split(" ");
    var sorted_specified = classes[2].replace("js-tab-", "");
    var page = button_more[sorted_specified];
    var type = {
        contracts: "contracts",
        inventory: "inventory",
        history: "history_inventory",
    }[sorted_specified];

    api.get("/user/load/" + page.support.pageLoaded[2] + "/" + type + "/" + page, {}, function (result) {
        result.filter(function (data) {
            var item = data.item,
                skin = sorted_skin_html.clone();
            $(skin).addClass("sorted-cotracts__unit--" + item.class_name);
            $(skin).find(".sorted-skins__cost").html(item.price);
            $(skin).find(".sorted-skins__skin-title--0").html(item.name);
            $(skin).find(".sorted-skins__skin-title--1").html(item.subname);
            $(skin).find(".weapon-skins__image").src("/img/" + item.image);
            $(".js-tab-" + sorted_specified).append(skin);
            
            button_more[sorted_specified]++;
        });
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
        $(".contract-result__input").each(function (i, e) {
            $(e).html( gap[i] );
        });
    });
});

// Popup

$(document).on("click", ".popup-window__close, .popup__cover", () => {
    page.popup.fadeOut();
});

page.popup.on = function ($window, options = {}) {
    switch ($window) {
        case "withdraw":
            let itemPrice = convert(parseFloat(options.item.price) + parseFloat(options.rnd));
            let item = options.item;
            this.wEdit({
                title: this.title,
                summary: this.summary.replace('{itemPrice}', itemPrice),
                content: `<div style="display:flex;justify-content:center;flex-direction:column;align-items:center;"><input class="popup-window__button button1" withdraw-skin placeholder="${getLanguage(`popup.${$window}.other.placeholder`)}"><button class="popup-window__button button2" onclick="withdrawConfirm(${item.id}, ${options.rnd})">${getLanguage(`popup.${$window}.other.button`)}</button></div>`,
            });
            break;

        case "withdraw_error":
            this.wEdit({
                title: this.title,
                summary: this.summary,
            });
            break;

        case "withdraw_avatar":
            this.wEdit({
                title: this.title,
                summary: this.summary,
                content: "<form class='avatar-change' method='POST' enctype='multipart/form-data' action='/api/v1/user/avatar'><div class='avatar-change__title'>" + getLanguage("popup.withdraw_avatar.avatar_change__title") + "</div><img src='/img/guest.png' class='avatar-change__avatar'><label><a class='avatar-change__input button1'>" + getLanguage("popup.withdraw_avatar.avatar_change__input") + "</a><input accept='.jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*' type='file' onchange='this.form.submit();' name='file' style='display: none; position: absolute;' ></label></form>",
            });
            break;

        case "auth":
            this.wEdit({
                title: this.title,
                content: '<div class="auth"><a href="/auth/vk" class="auth__button auth__button--vkontakte">Вконтакте</a><a href="/auth/twitch" class="auth__button auth__button--twitch">Twitch</a><a href="/auth/youtube" class="auth__button auth__button--youtube">Youtube</a></div>',
                help: getLanguage(`popup.${$window}.help`),
            });
            break;
        case "sell_all":
            this.wEdit({
                title: this.title,
                summary: this.summary.replace("{price}", options.inventoryPrice),
                content: `<div style="display:flex;justify-content:center;"><button class="popup-window__button button2" onclick="features.popup.close();">${getLanguage("popup." + $window + ".buttons.no")}</button><button class="popup-window__button button1" onclick="${options.callback2}">${getLanguage("popup." + $window + ".buttons.yes")}</button></div>`,
            });
            break;
        case "sell_all_error":
            this.wEdit({
                title: this.title,
                summary: this.summary,
            });
            break;
        case "0ge":
            this.wEdit({
                title: this.title,
                summary: this.summary.replace("{skin}", options.skin),
            });
            break;

        case "top_up":
            this.wEdit({
                title: "Пополнение баланса",
                summary: "Для пополнения баланса вы будете перемещены на сайт платёжной системы",
                content: `<div class="top-up">
                            <div class="promocode">
                                <input type="text" class="promocode__input" placeholder="Промокод">
                                <span class="promocode__text">Если у вас есть промокод введите выше</span>
                            </div>
                            <div class="top-up__row">
                                <input type="text" class="top-up__text" value="1 000">
                                <input type="submit" class="top-up__button" value="Пополнить">
                            </div>
                        </div>`,
                help: '<div class="paysys paysys--1"><img src="https://standoffcase.ru/assets/img/payments_systems/mastercard.svg" class="paysys__image"><img src="https://standoffcase.ru/assets/img/payments_systems/webmoney.svg" class="paysys__image"><img src="https://standoffcase.ru/assets/img/payments_systems/qiwi.svg" class="paysys__image"><img src="https://standoffcase.ru/assets/img/payments_systems/yandex.svg" class="paysys__image"><img src="https://standoffcase.ru/assets/img/payments_systems/visa.svg" class="paysys__image"></div>',
            });
            $(".popup-window__top-up--big-input").on('input', function () {
                var value = $(this).val();
                if (value == "") {
                    $(".top_up_text").text(getLanguage("popup.top_up.promocode.default"));
                    return;
                }
                $.get("/api/v1/user/promo?name=" + encodeURIComponent(value), (data) => {
                    if (data.percent) {
                        $(".top_up_text").text(getLanguage("popup.top_up.promocode.percent").replace("{percent}", data.percent));
                    } else {
                        $(".top_up_text").text(getLanguage("popup.top_up.promocode.not_found"));
                    }
                });
            });
            break;

        case "vk-accept":
            this.wEdit({
                content: '<div class="vk-accept"> <section> <div class="vk-accept__title">' + this.wText("sections.1") + '</div> <div class="vk-accept__content"> <div class="mauto" id="vk_groups"></div> </div> </section> <section> <div class="vk-accept__title">' + this.wText("sections.2") + '</div> <div class="vk-accept__content"> <div class="mauto width150" id="vk_allow_messages_from_community"></div> </div> </section> <section> <div class="vk-accept__title">' + this.wText("sections.3") + '</div></section> <button onclick="_closePopup()" class="button1">' + this.wText("button") + '</button> </div>',
            });

            // VK Widgets
            VK.Widgets.AllowMessagesFromCommunity("vk_allow_messages_from_community", { height: 30 }, 187346506);
            VK.Widgets.Group("vk_groups", { mode: 1, no_cover: 1 }, 187346506);
            break;

        case "pay_confirm":
            this.wEdit({
                title: this.title,
                summary: this.summary,
                content: `<div style="display:flex;justify-content:center;"><button class="popup-window__button button2" onclick="${options.callback1}">${getLanguage("popup." + $window + ".buttons.yes")}</button><button class="popup-window__button button1" onclick="${options.callback2}">${getLanguage("popup." + $window + ".buttons.no")}</button></div>`,
            });
            break;

        // Default
        default:
            this.wEdit({
                title: this.title,
                summary: this.summary,
            });
            break;
    }
    // Additional Events
    //if ($window == "top_up") Mmenu("hide");
};