// Extending Functions

$.fn.extend({
    toggleText: function (a, b = null) {
        return this.html(this.html() == b ? a : b);
    }
});

// Events

$(".js-option-volume").click(function () {
    $(this)
        .find(".stndfspin-features__icon")
        .toggleClass("stndfspin-button--unfilled")
        .toggleClass("stndfspin-features__icon--green")
        .parent().find(".stndfspin-features__column > span")
        .toggleText("Вкл.", "Выкл.");
});

// Classes

// Functions