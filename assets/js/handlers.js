// Handlers

// Minor Functions

features.sound.onclick = function (tap) {
    console.log("Sound has been turned " + tap);
}

features.lang.onclick = function (tap) {
    console.log("Language has been switched to " + tap);
}

// Timer

features.timer.initiate({
    seconds: 14,
    hours: 2,
    minutes: 6, 
});

console.log("Timer", features.timer.promise);

// Wheel

function wheel_start() {
    features.wheel.init();

    /*
    
    features.wheel.win({
        id: 14,
        skin: {
            image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
            title: "Skin бомжа",
        },
    });
    
    */

    features.wheel.multiple_win({
        0: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },

        1: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },

        2: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },

        3: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },

        4: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },

        5: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },

        6: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },

        7: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },

        8: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },

        9: {
            id: 7,
            skin: {
                image: "https://standoffcase.ru/img/hFRns34E7g-Screenshot_8.jpg",
                title: "Skin бомжа0",
            }
        },
    });
}

console.log("Wheel", features.wheel.promise);
/*
features.wheel.reopen.onclick = function () {
    console.log("The wheel has been reopenned");
}
*/
// Popup

features.popup.on = function ($window, options = {}) {
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
}