// Smoothscroll polyfill for safari https://github.com/iamdustan/smoothscroll
function polyfill(){function m(a,b){this.scrollLeft=a;this.scrollTop=b}function f(a){if(null===a||"object"!==typeof a||void 0===a.behavior||"auto"===a.behavior||"instant"===a.behavior)return!0;if("object"===typeof a&&"smooth"===a.behavior)return!1;throw new TypeError("behavior member of ScrollOptions "+a.behavior+" is not a valid value for enumeration ScrollBehavior.");}function l(a,b){if("Y"===b)return a.clientHeight+n<a.scrollHeight;if("X"===b)return a.clientWidth+n<a.scrollWidth}function p(a,c){var d=b.getComputedStyle(a,null)["overflow"+c];return"auto"===d||"scroll"===d}function t(a){var b=l(a,"Y")&&p(a,"Y");a=l(a,"X")&&p(a,"X");return b||a}function q(a){var c=(r()-a.startTime)/468;var d=.5*(1-Math.cos(Math.PI*(1<c?1:c)));c=a.startX+(a.x-a.startX)*d;d=a.startY+(a.y-a.startY)*d;a.method.call(a.scrollable,c,d);c===a.x&&d===a.y||b.requestAnimationFrame(q.bind(b,a))}function g(a,c,d){var e=r();if(a===h.body){var f=b;var g=b.scrollX||b.pageXOffset;a=b.scrollY||b.pageYOffset;var l=k.scroll}else f=a,g=a.scrollLeft,a=a.scrollTop,l=m;q({scrollable:f,method:l,startTime:e,startX:g,startY:a,x:c,y:d})}var b=window,h=document;if(!("scrollBehavior"in h.documentElement.style&&!0!==b.__forceSmoothScrollPolyfill__)){var e=b.HTMLElement||b.Element,k={scroll:b.scroll||b.scrollTo,scrollBy:b.scrollBy,elementScroll:e.prototype.scroll||m,scrollIntoView:e.prototype.scrollIntoView},r=b.performance&&b.performance.now?b.performance.now.bind(b.performance):Date.now,n=/MSIE |Trident\/|Edge\//.test(b.navigator.userAgent)?1:0;b.scroll=b.scrollTo=function(a,c){void 0!==a&&(!0===f(a)?k.scroll.call(b,void 0!==a.left?a.left:"object"!==typeof a?a:b.scrollX||b.pageXOffset,void 0!==a.top?a.top:void 0!==c?c:b.scrollY||b.pageYOffset):g.call(b,h.body,void 0!==a.left?~~a.left:b.scrollX||b.pageXOffset,void 0!==a.top?~~a.top:b.scrollY||b.pageYOffset))};b.scrollBy=function(a,c){void 0!==a&&(f(a)?k.scrollBy.call(b,void 0!==a.left?a.left:"object"!==typeof a?a:0,void 0!==a.top?a.top:void 0!==c?c:0):g.call(b,h.body,~~a.left+(b.scrollX||b.pageXOffset),~~a.top+(b.scrollY||b.pageYOffset)))};e.prototype.scroll=e.prototype.scrollTo=function(a,b){if(void 0!==a)if(!0===f(a)){if("number"===typeof a&&void 0===b)throw new SyntaxError("Value could not be converted");k.elementScroll.call(this,void 0!==a.left?~~a.left:"object"!==typeof a?~~a:this.scrollLeft,void 0!==a.top?~~a.top:void 0!==b?~~b:this.scrollTop)}else{var c=a.left,e=a.top;g.call(this,this,"undefined"===typeof c?this.scrollLeft:~~c,"undefined"===typeof e?this.scrollTop:~~e)}};e.prototype.scrollBy=function(a,b){void 0!==a&&(!0===f(a)?k.elementScroll.call(this,void 0!==a.left?~~a.left+this.scrollLeft:~~a+this.scrollLeft,void 0!==a.top?~~a.top+this.scrollTop:~~b+this.scrollTop):this.scroll({left:~~a.left+this.scrollLeft,top:~~a.top+this.scrollTop,behavior:a.behavior}))};e.prototype.scrollIntoView=function(a){if(!0===f(a))k.scrollIntoView.call(this,void 0===a?!0:a);else{for(a=this;a!==h.body&&!1===t(a);)a=a.parentNode||a.host;var c=a.getBoundingClientRect(),d=this.getBoundingClientRect();a!==h.body?(g.call(this,a,a.scrollLeft+d.left-c.left,a.scrollTop+d.top-c.top),"fixed"!==b.getComputedStyle(a).position&&b.scrollBy({left:c.left,top:c.top,behavior:"smooth"})):b.scrollBy({left:d.left,top:d.top,behavior:"smooth"})}}}}"object"===typeof exports&&"undefined"!==typeof module?module.exports={polyfill:polyfill}:polyfill();

const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
if ( hasScrollbar ) { document.body.classList.add("has-scrollbar") }

async function searchWebsite ( term ) {
    const terms = [' '].concat( ...term.toLowerCase().split(' ') );
    if ( term.length >= 3 ) {
        return {
            articles: articles.filter( article => terms.reduce( (x,term) => x && article.title.toLowerCase().match( term ) )),
            serachPages: serachPages.filter( article => terms.reduce( (x,term) => x && article.title.toLowerCase().match( term ) )),
        }
    }

    return { articles: [], serachPages: [] };
}

function searchListeners() {
    const searchInput = document.getElementById( "greedyboy-search" );

    if ( !searchInput ) {
        console.warn("Could not find the site search bar")
        return;
    }

    const searchParent = searchInput.parentElement;
    const searchResults = searchInput.nextElementSibling;

    searchParent.addEventListener( "click", () => searchInput.focus() );

    searchInput.addEventListener( "focus", () => searchParent.classList.add("active") );
    searchInput.addEventListener( "blur", () => searchParent.classList.remove("active") );
    searchResults.addEventListener( "focus", () => searchParent.classList.add("active") );
    searchResults.addEventListener( "blur", () => searchParent.classList.remove("active") );
    
    
    searchInput.addEventListener( "keyup", async function(){
        const results = await searchWebsite(searchInput.value);
        searchResults.innerHTML =
            results.articles.map(
                result => `<a href="${result.url}">${result.title}</a>`
            ).slice(0,5).join("") +
            results.serachPages.map(
                result => `<a href="${result.url}">${result.title}</a>`
            ).slice(0,5).join("")
    });
}

searchListeners();

// iOS fix for the blur event not firing on the search bar
document.addEventListener('touchstart', function( e ){
    document.activeElement.blur();
});

// Lazy Loading Images
const loadImage = function( lazyImage ){
    [...lazyImage.parentElement.querySelectorAll('[srcset]')].forEach(sourceElem => {
        sourceElem.srcset = sourceElem.dataset.srcset
    });

    lazyImage.src = lazyImage.dataset.src;
    lazyImage.onload = () => lazyImage.parentElement.classList.add("loaded");
}

const lazyEvents = function() {
    var lazyImages = [].slice.call(document.querySelectorAll("picture.lazy:not(.loaded) img"));
  
    if ("IntersectionObserver" in window) {
      let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            let lazyImage = entry.target;
            loadImage( lazyImage );

            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });
  
      lazyImages.forEach(function(lazyImage) {
        lazyImageObserver.observe(lazyImage);
      });
    } else {
      // Possibly fall back to a more compatible method here
    }
}
document.addEventListener("DOMContentLoaded", lazyEvents);

// Sliders!
function slider( sliderElem, slideInterval=-1, onSlideChange=()=>{} ) {
    const numberOfSlides = sliderElem.children.length;
    const getActiveSlide = () => {
        const slidesLeft = (sliderElem.scrollLeft / sliderElem.offsetWidth) + 0.5;
        const slidesTop = (sliderElem.scrollTop / sliderElem.offsetHeight) + 0.5;
        return Math.floor( Math.max( slidesLeft, slidesTop ) )
    };
    const gotoSlide = n => {
        sliderElem.scroll({
            left: [...sliderElem.children].slice(0, n).map( x => x.offsetWidth ).concat(0).reduce( (a,b) => a+b ),
            top: [...sliderElem.children].slice(0, n).map( x => x.offsetHeight ).concat(0).reduce( (a,b) => a+b ),
            behavior: 'smooth'
        });
        onSlideChange({ slide: n });
    }

    const next = sliderElem.parentElement.querySelector( '.next' );
    const prev = sliderElem.parentElement.querySelector( '.prev' );

    const prevSlide = () => gotoSlide(
        (getActiveSlide() == 0) ?  numberOfSlides-1 : getActiveSlide() - 1
    );
    const nextSlide = () => gotoSlide(
        (getActiveSlide() + 1) % numberOfSlides
    );

    let slideTimer,
      resetTimer = ()=>{};
    if ( slideInterval > 0 ) {
        slideTimer = setInterval(nextSlide, slideInterval);
        resetTimer = () => {
            clearInterval(slideTimer);
            slideTimer = setInterval(nextSlide, slideInterval);
        }
    }

    const onScroll = function(){
        const activeSlide = getActiveSlide();

        onSlideChange({ slide: activeSlide });

        const featuredColor = sliderElem.children[activeSlide].getAttribute('data-featured-color');
        if ( featuredColor ) {
            next.children[0].style.borderColor = featuredColor;
            prev.children[0].style.borderColor = featuredColor;
        }

        const dots = [...sliderElem.parentElement.parentElement.querySelectorAll('.dot')];
        if ( dots.length ) {
            dots.forEach( ( dot, i ) => {
                if ( i === activeSlide ) {
                    dot.classList.add( "active" );
                } else {
                    dot.classList.remove( "active" );
                }
            });
        }

        resetTimer();
    }

    if ( prev ) prev.onclick = () => prevSlide();
    if ( next ) next.onclick = () => nextSlide();
    sliderElem.onscroll = onScroll;

    onScroll();

    return { gotoSlide }
}
const headerSliderElem = document.querySelector('.header.slider .slides');
if ( headerSliderElem ) slider(  headerSliderElem, 5000 );

const productSliders = [...document.querySelectorAll('.product.slider .slides')];
productSliders.forEach( productSlider => slider( productSlider, -1 ) );

const homepageHeroSlider = document.querySelector('.hero');
if ( homepageHeroSlider ) {
    const articleListItems = [...document.querySelectorAll( ".article-list-item" )];
    const { gotoSlide } = slider( homepageHeroSlider, 5000, function( { slide } ){
        articleListItems.forEach( ( listItem, i ) => {
            listItem.classList.remove( "active" )
            if ( i === slide ) listItem.classList.add( "active" )
        } )
    });
    articleListItems.forEach( (elem, i) => {
        elem.addEventListener("mouseover", () => gotoSlide(i) );
    } )
}

const lumenosety = (R, G, B) => (R*299 + G*587 + B*114) / (1000*255)
const darken = (R, G, B, iterations) => [ 
    Math.floor(R - iterations*Math.sqrt(R/255)),
    Math.floor(G - iterations*Math.sqrt(G/255)),
    Math.floor(B - iterations*Math.sqrt(B/255))
];
const generateContrastingColor = (R, G, B) => {
    let i = 0;
    while ( lumenosety(...darken(R, G, B, i)) > 0.4 ) {
        i++;
    }
    return darken(R, G, B, i);
}

// Cookie notice
function cookiePopup() {
    if( localStorage.getItem("acceptsCookies") == null ) {
        localStorage.setItem("acceptsCookies",1);
        const cookiePopupElem = document.getElementById("cookie");
        cookiePopupElem.style.display = "block";
        const seconds = cookiePopupElem.querySelector(".seconds");

        const closeCookiePopupElem = () => cookiePopupElem.style.bottom = "-200px";

        const countDown = setInterval(function(){
            // Don't keep counting down if hovering over the popup
            if ( cookiePopupElem.matches(":hover") ) return;

            if ( seconds.innerHTML <= 1 ) {
                clearInterval(countDown);
                closeCookiePopupElem();
                return;
            }
            seconds.innerHTML = seconds.innerHTML - 1;
        }, 1000);

        const closeButton = cookiePopupElem.querySelector(".close");
        closeButton.onclick = closeCookiePopupElem;
    }
}
window.onload = function () {
    setTimeout(function () {
        cookiePopup();
        lazyEvents();
    }, 0);
}