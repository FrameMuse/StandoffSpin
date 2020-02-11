// Handlers

// DOM Listening for LiveFeed Change

DOM.listen(".live-drops__inner", (type, element) => {
    if (type != "childList") return;
    var length = $(element).find(".weapon-skins__weapon").length;
    if (length > 25) features.liveFeed.removeLast();
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
                DOM.update("socket-update", result);
                break;
            
            case "bonus_update":
                DOM.update("bonus-update", result);
                break;
            
            case "livedrop":
                for (const item in result.items) {
                    features.liveFeed.add(item);
                }
                break;
        }
    });
})();

(function () {
    setInterval(() => {
        api.post("/user/update");
    }, 270000);
})()

// Language

features.lang.onclick = function (tap) {
    api.post("/language/set/" + tap, {}, function () {
        window.location.reload();
    });
}

// Pages

features.paging.addPage("/contracts", () => {
    features.contract.init();
    features.contract.spot.init();
    features.canvas.init();
});

features.paging.addPage("/referal", () => {
    features.referal.init();
});

features.paging.addPage("/bonuses", () => {
    // Бонусики
});

// Opencase Wheel

features.wheel.reopen.onclick = function () {
    features.paging.load(window.location.pathname);
}

features.wheel.release = function (fast = false) {
    features.wheel.init();
    // API Connection
    api.post("/case/open", {
        id: features.paging.pageLoaded[2],
        multiplier: features.wheel.data.multiplier
    }, result => {
        if ("error" in result) {
            features.paging.notify("error", result.error_msg)
            return;
        }
        features.wheel.multiple_win(result.itemList, fast);
        // Balance Update
        DOM.update("required-update", {
            balance: split_number(result.balance) + " Р"
        });
    });
}

$(document).on("click", ".box__view .fortune-wheel__button--0", () => {
    features.wheel.release(true)
});
$(document).on("click", ".box__view .fortune-wheel__button--1", () => {
    features.wheel.release(false)
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
    api.post("/bonus/prize_promo", {
        promo: $(".js-bonus-balance-gap").val(),
    }, (result) => {
        features.paging.notify("success", result.success_message)
    });
});

// Referal

$(document).on("click", ".js-referal-active-button", function () {
    api.post("/referal/active", {
        code: $(".js-referal-active-gap").val(),
    }, (result) => {
        features.paging.notify("success", result.success_message)
    });
});

$(document).on("click", ".js-referal-save-button", function () {
    api.post("/referal/save", {
        code: $(".js-referal-save-gap").val(),
    }, (result) => {
        features.paging.notify("success", result.success_message)
    });
});

// Popup

features.popup.on = function ($window, options = {}) {
    switch ($window) {
        case "withdraw":
            let itemPrice = convert(parseFloat(options.item.price) + parseFloat(options.rnd));
            let item = options.item;
            this.wEdit({
                title: this.title,
                summary: this.summary.replace('{itemPrice}', itemPrice),
                content: `<div style="display:flex;justify-content:center;flex-direction:column;align-items:center;"><input class="popup-window__button button1" withdraw-skin placeholder="${this.getLanguage(`popup.${$window}.other.placeholder`)}"><button class="popup-window__button button2" onclick="withdrawConfirm(${item.id}, ${options.rnd})">${this.getLanguage(`popup.${$window}.other.button`)}</button></div>`,
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
                content: "<form class='avatar-change' method='POST' enctype='multipart/form-data' action='/api/v1/user/avatar'><div class='avatar-change__title'>" + this.getLanguage("popup.withdraw_avatar.avatar_change__title") + "</div><img src='/img/guest.png' class='avatar-change__avatar'><label><a class='avatar-change__input button1'>" + this.getLanguage("popup.withdraw_avatar.avatar_change__input") + "</a><input accept='.jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*' type='file' onchange='this.form.submit();' name='file' style='display: none; position: absolute;' ></label></form>",
            });
            break;

        case "auth":
            this.wEdit({
                title: this.title,
                content: '<div class="auth"><a href="/auth/vk" class="auth__button auth__button--vkontakte">Вконтакте</a><a href="/auth/twitch" class="auth__button auth__button--twitch">Twitch</a><a href="/auth/youtube" class="auth__button auth__button--youtube">Youtube</a></div>',
                help: this.getLanguage(`popup.${$window}.help`),
            });
            break;
        case "sell_all":
            this.wEdit({
                title: this.title,
                summary: this.summary.replace("{price}", options.inventoryPrice),
                content: `<div style="display:flex;justify-content:center;"><button class="popup-window__button button2" onclick="features.popup.close();">${this.getLanguage("popup." + $window + ".buttons.no")}</button><button class="popup-window__button button1" onclick="${options.callback2}">${this.getLanguage("popup." + $window + ".buttons.yes")}</button></div>`,
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
                    $(".top_up_text").text(this.getLanguage("popup.top_up.promocode.default"));
                    return;
                }
                $.get("/api/v1/user/promo?name=" + encodeURIComponent(value), (data) => {
                    if (data.percent) {
                        $(".top_up_text").text(this.getLanguage("popup.top_up.promocode.percent").replace("{percent}", data.percent));
                    } else {
                        $(".top_up_text").text(this.getLanguage("popup.top_up.promocode.not_found"));
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
                content: `<div style="display:flex;justify-content:center;"><button class="popup-window__button button2" onclick="${options.callback1}">${this.getLanguage("popup." + $window + ".buttons.yes")}</button><button class="popup-window__button button1" onclick="${options.callback2}">${this.getLanguage("popup." + $window + ".buttons.no")}</button></div>`,
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
}