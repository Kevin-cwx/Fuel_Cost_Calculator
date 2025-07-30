var log = console.log;

const yearSelect = document.getElementById("YearPicker");
const currentYear = new Date().getFullYear();

//
let currentCar = "/Media/Cars/sedan.png";
$("#Car").attr("src", currentCar);

function updateOptions() {
    $(".Car_Option").each(function () {
        const optionSrc = $(this).data("src");
        if (optionSrc === currentCar) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
}

updateOptions();

$(document).on("click", ".Car_Option", function () {
    const clickedSrc = $(this).data("src");
    currentCar = clickedSrc;
    $("#Car").attr("src", currentCar);
    $(".Car_Option").removeClass("selected");
    $(this).addClass("selected");
    updateOptions();
});


