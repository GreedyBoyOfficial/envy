function timeSinceDate(date, lang) {
    function render(n, unit) {
        if ( lang == "es" ) {
            unit = { year: "año", month: "mes", week: "semana", day: "dia" }[unit];
            return "hasta " + n + " " + unit + ((n == 1) ? "" : "s");;
        }
        return n + " " + unit + ((n == 1) ? "" : "s") + " ago";
    }

    var seconds = Math.floor((new Date() - date) / 1000);

    var years = Math.floor(seconds / (60 * 60 * 24 * 365));
    if ( years ) return render(interval, "year");

    const months = Math.floor(seconds / (60 * 60 * 24 * 30));
    if ( months ) return render( months, "month" );

    const weeks = Math.floor(seconds / (60 * 60 * 24 * 7));
    if ( weeks ) return render( weeks, "week" );

    const days = Math.floor(seconds / (60 * 60 * 24));
    if ( days ) return render( days, "day" );
    
    return "brand new"
}

const lang = document.body.parentElement.getAttribute("lang");

[...document.querySelectorAll(".time-since-published")].forEach( timeElem => {
    const date = Date.parse(timeElem.getAttribute("datetime"));
    timeElem.innerHTML = timeSinceDate(date, lang);
});

window.addEventListener('load', function () {
    if ( typeof Lightense !== "undefined" ) {
        Lightense('picture.zoomable img');
    }
}, false);

[...document.querySelectorAll(".product.slider.zoomable")].forEach( slider => slider.onclick = e => {
    if ( e.target.nodeName !== "IMG" && e.target.nodeName !== "PICTURE" ) return;
    slider.parentElement.classList.toggle( "fullscreen" );
});

document.body.onscroll = function(){
    [...document.querySelectorAll('.fullscreen')].forEach( elem => elem.classList.remove('fullscreen') )
};