// Extending Functions

$.fn.extend({
    toggleText: function (a, b = null) {
        return this.html(this.html() == b ? a : b);
    }
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

const features = new class {
    constructor() {
        this.sound = new features_sound();
        this.lang = new features_lang();
    }
}

// Functions

