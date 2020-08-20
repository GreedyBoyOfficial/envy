async function getProducts ( {match, limit, skip, sort} ) {
    match = {
        $and: [
            match,
            { "price.number": { $gt: 100 } }
        ]
    }
    const query = encodeURIComponent(JSON.stringify({ match, limit, skip, sort}))
    const response = await fetch("/api/get-query?query="+query);
    return response.json();
}

async function getResults({ pageNum, sort, excludeIds=[], productsPerPage, query }) {

    if ( excludeIds.length ) {
        query = { $and: [ query, { _id: { $nin: excludeIds } } ] }
    }
    
    const products = await getProducts({
        match: query,
        sort,
        skip: productsPerPage*(pageNum-1),
        limit: productsPerPage
    });
    return products;
}

function renderPaginationLink({ totalPages, currentPage=-1, pageNum, content=pageNum }) {

    // If the page doesn't exist, leave a blank
    // so everything is centered nicely
    if ( pageNum < 1 || pageNum > totalPages) {
        return `<li class=\"empty\"><span>&nbsp;</span></li>`;
    }

    // If we're on the page, don't link but
    // still display the content
    if ( pageNum == currentPage ) {
        return `<li><span>${content}</span></li>`;
    }

    // Otherwise generate the url that corrisponds
    // to the result page and return that
    let url = new URL( window.location.href );
    url.searchParams.set('p', pageNum);
    return `<li><a href="${url}">${content}</a></li>`
}

function renderPagination({ productsPerPage, totalProducts, currentPage }) {

    console.log(productsPerPage, totalProducts, currentPage)

    if ( currentPage > 1 ) {
        // Change canonical url to avoid duplicate content
        const canonicalTag = document.querySelector('link[rel="canonical"]');
        canonicalTag.setAttribute("href", canonicalTag.href+"?p="+currentPage);
    }

    const totalPages = Math.ceil( totalProducts / productsPerPage );

    let firstPage = "<li class=\"empty\"><span>&nbsp;&nbsp;&nbsp;</span></li>";
    if ( currentPage - 3 > 1 ) {
        firstPage = renderPaginationLink({
            totalPages,
            pageNum: 1,
            content: "⏮ 1..."
        })
    }

    let lastPage = "<li style='width: 80px'><span>&nbsp;&nbsp;&nbsp;</span></li>";
    if ( currentPage + 3 < totalPages ) {
        lastPage = renderPaginationLink({
            totalPages,
            pageNum: totalPages,
            content: "..." + totalPages + " ⏭"
        })
    }

    let pageLinks = "";
    for (let pageNum = currentPage - 3; pageNum <= currentPage + 3; pageNum++) {
        pageLinks += renderPaginationLink({ totalPages, pageNum, currentPage });
    }

    document.getElementById("pagination").innerHTML = firstPage + pageLinks + lastPage;
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

function copyProductURLEvent( { target } ){
    const productURL = target.getAttribute("data-url");
    const success = copyToClipboard( productURL );
    console.log( success )
    if ( success ) {
        const before = target.innerHTML;
        target.innerHTML = `✔️ ${ localization.copied }!`;
        setTimeout( () => target.innerHTML = before, 5000 )
    }
}

function shareProductURLEvent( { target } ){
    const productURL = target.getAttribute("data-url");
    navigator.share({
        title: target.getAttribute("data-title"),
        text: target.getAttribute("data-text"),
        url: target.getAttribute("data-url"),
    })
        // .then(() => console.log('Successful share'))
        // .catch((error) => console.log('Error sharing', error));
}

const renderImage = ({ background, legacy, alt }) => {
    return `<picture class="lazy" style="background: ${background}">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="${legacy}" alt="${alt}" />
    </picture>`
}

const roundedNumberWithCommas = (x) => {
    return Math.ceil(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function renderProduct( product, options ) {
    const language = document.querySelector("html").getAttribute("lang");
    
    options = options ? options : {};
    const productColor = 'rgb('+ product.dominantColor.join(',') +')';
    const contrastingProductColor = 'rgb('+ generateContrastingColor(...product.dominantColor).join(',') +')';

    let convertedPrice = roundedNumberWithCommas( product.price.number / exchangerates.rates[product.price.currency] );

    let priceText = localization.CURRENCY_SIGN + convertedPrice;
    if ( product.saleprice.percent !== 0 ) {
        let convertedSalePrice = roundedNumberWithCommas( product.saleprice.number / exchangerates.rates[product.price.currency] );
        priceText = "<b>"+localization.CURRENCY_SIGN + convertedSalePrice + "</b> <s><span>"+ priceText +"</span></s> "
    }

    let productName = product.productname;
    let description = product.description.short.length > product.description.long.length ? 
                        product.description.short : product.description.long;
    if ( product.description.custom ) {
        description = product.description.custom;
    }
    console.log( product.localization, language )
    if ( product.localization && product.localization[language] ) {
        console.log( product.localization[language] );
        productName = product.localization[language].productname;

        if ( product.localization[language].description ) {
            description = product.localization[language].description;
        }
    }

    const isTouchScreen = !!navigator.maxTouchPoints;
    const browerCanShare = !!navigator.share;
    const useShare = isTouchScreen && browerCanShare;

    return `<div class="product-tile${ product.isFeatured ? " featured" : '' }${ options.expanded ? " product-tile--expanded" : "" }${ options.wide ? " product-tile--wide" : "" }">
    <div>
        <figure>
            <div class="slider product" style="background: ${productColor}">
                <div class="slides">
                    ${ product.images.map( image => renderImage({ background: product.backgroundColor, legacy: image, alt: product.name }) ).join('') }
                </div>
                <div class="prev"><span style="border-color: ${contrastingProductColor}"></span></div>
                <div class="next"><span style="border-color: ${contrastingProductColor}"></span></div>
                <span class="price" style="background: ${contrastingProductColor}">${ priceText }</span>
            </div>
            <div class="dots">
                ${ product.images.map( (x, i) => `<div class="dot${i===0?' active':''}"></div>` ).join('') }
            </div>
            <figcaption>
                <span class="title">${productName}</span><br>
            </figcaption>
        </figure>
        <div class="details">
            <br>
            <h3 class="title">${productName}</h3>
            <span>${ priceText }</span> 
            <p>${description.replace(/\n/g, "<br>")}</p>
            <a class="button" href="${product.linkurl}" style="background: ${contrastingProductColor}" target="_blank" rel="nofollow">
                <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-359.000000, -2495.000000)"><g transform="translate(345.000000, 2489.000000)"><g transform="translate(12.000000, 4.000000)"><polygon points="0 0 24 0 24 24 0 24"></polygon><path d="M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 C17.52,22 22,17.52 22,12 C22,6.48 17.52,2 12,2 Z M11,19.93 C7.05,19.44 4,16.08 4,12 C4,11.38 4.08,10.79 4.21,10.21 L9,15 L9,16 C9,17.1 9.9,18 11,18 L11,19.93 Z M17.9,17.39 C17.64,16.58 16.9,16 16,16 L15,16 L15,13 C15,12.45 14.55,12 14,12 L8,12 L8,10 L10,10 C10.55,10 11,9.55 11,9 L11,7 L13,7 C14.1,7 15,6.1 15,5 L15,4.59 C17.93,5.78 20,8.65 20,12 C20,14.08 19.2,15.97 17.9,17.39 Z" id="Shape" fill="#FFFFFF" fill-rule="nonzero"></path></g></g></g></g></svg>
                ${ ((string) => string.charAt(0).toUpperCase() + string.slice(1))(localization.buyOn) } ${product.merchantname}
            </a>
            <div class="share-links" onclick="${ useShare ? "share" : "copy"}ProductURLEvent(event)" data-title="${productName}" data-url="${options.url}" data-text="View this product on GreedyBoy">🔗 ${ useShare ? localization.shareProduct : localization.copyLink }</div>
        </div>
    </div></div>`
}

function filterEvents({ sortOptions, sort, includeSectionFilter }) {
    
    // Set the sort filters value
    const sortFilter = document.querySelector('.filter.sort');

    sortFilter.querySelector(".value").innerHTML = " " + sortOptions[sort].name;

    // Get the options for the sort filter
    let sortFilterOptions = '';
    for (let i = 0; i < sortOptions.length; i++) {

        // Don't include the selected option
        // in the options list
        if ( i == sort ) continue;

        // Generate the url for each filter
        let url = new URL( window.location.href );
        url.searchParams.set('s', i);

        // Add the option
        sortFilterOptions += `<li>
            <a rel="nofollow" href="${ url.pathname+url.search+url.hash }">${ sortOptions[i].name }</a>
        </li>`;
    }

    sortFilter.querySelector(".filter-options").innerHTML = sortFilterOptions;

    const filterBar = document.getElementById("f");
    if ( includeSectionFilter ) {

        // Show the category filter
        filterBar.querySelector(".category").style.display = "inline-block";

        // Modidify links so that the category filter
        // is included on those pages too
        [...filterBar.querySelectorAll('a')].forEach( linkElem => {

            // Generate the url with the 'n' param set
            // example.com is used because all filter links
            // are relative
            let url = new URL( "https://example.com" + linkElem.getAttribute("href") );
            url.searchParams.set('n', 1);

            // Output the relative url
            linkElem.setAttribute('href', url.pathname + url.search + url.hash );
        });
    }

    [...document.querySelectorAll(".filter .filter-label")].forEach( filterLabel => {

        // Clicking the filter label on mobile expands
        // the filter view
        filterLabel.onclick = e => {
            if ( e.target.classList.contains('filter-label') )  {
                e.target.parentElement.classList.toggle("expanded")
            }
        }
    });

    // Opening and closing the filter bar on mobile
    filterBar.querySelector('.popup-cancel').onclick = () => filterBar.classList.remove('popup')
    filterBar.querySelector('.mobile-view-toggle').onclick = () => filterBar.classList.add('popup')

    // If we scroll past the filter bar, pin it
    // to the top of the screen
    let filterBarOffsetTop = filterBar.offsetTop;
    window.onscroll = () => {
        // update the top offset when the filter bar is not
        // sticking to account for it shifting down
        // (ex: featured image above loading)
        if ( !filterBar.classList.contains("sticky") ) {
            filterBarOffsetTop = filterBar.offsetTop
        }

        if ( window.scrollY > filterBarOffsetTop ) {
            filterBar.classList.add("sticky");
        } else {
            filterBar.classList.remove("sticky");
        }
    }
}

function slugify (str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

function renderProducts({ productContainer, products }){
    productContainer.innerHTML = 
        products.map( product => {
            const productIdHex = parseInt(product._id.slice(0,-4)).toString(36);
            const slugifiedName = slugify( product.productname );
            const path = localization.product+"/"+window.location.pathname.split("/").slice(2).join("/")
            try {
                return renderProduct( product, { url: window.origin+"/"+path+"/"+slugifiedName+"-"+productIdHex } );
            } catch (error) {
                console.error( error );
                return "";
            }
        }
    ).join('')

    animateCSSGrid.wrapGrid(productContainer, {
        duration: 350,
        stagger: 10,
    });

    const productTiles = productContainer.querySelectorAll('.product-tile')
    for ( i=0; i < productTiles.length; i++) {
        const tileElem = productTiles[i];

        // When you click on the slides of the tiles
        tileElem.querySelector(".slides").onclick = function(){

            // Expand or contract them
            tileElem.classList.toggle("product-tile--expanded");

            // Then scroll to their location
            window.scrollTo({
                top: tileElem.offsetTop - document.getElementById("f").offsetHeight,
                behavior: 'smooth'
            });

            // Force load lazy images upon opening
            [...tileElem.querySelectorAll(".lazy:not(.loaded) img")].forEach( img => loadImage(img) )
        }
    }

    // Add slider events
    const productSliders = [...document.querySelectorAll('.product.slider .slides')];
    productSliders.forEach( productSlider => slider( productSlider, -1 ) );

    // Lazy load images
    lazyEvents();
}

(async function(){
    if ( !document.getElementById("data") ) return;

    // Get all querystring parameters
    const params = new URLSearchParams(window.location.search);
    const pageNum = params.get('p') ? parseInt(params.get('p')) : 1;
    const sort = params.get('s') ? params.get('s') : 0;
    const includeSectionFilter = params.get("n") == 1;

    // Get all cached data
    const data = JSON.parse( document.getElementById("data").innerHTML );

    let results;
    if ( pageNum == 1 && sort == 0 ) {

        // If we're on the first page with default
        // sorting, use the cached products
        results = data.cachedProducts;

    } else if ( pageNum > 1 && sort == 0 ) {

        // If sort is 0 then the first page of results
        // were cached, exclude cached items and treat
        // second page as first to compensate
        results = await getResults({
            pageNum: pageNum-1,
            excludeIds: data.cachedProducts.map( product => product._id ),
            productsPerPage: data.productsPerPage,
            query: data.query,
            sort: data.sort[sort].query
        });
    } else {

        // Otherwise keep the search nice and simple
        results = await getResults({
            pageNum,
            productsPerPage: data.productsPerPage,
            query: data.query,
            sort: data.sort[sort].query
        });
    }

    renderPagination({
        productsPerPage: data.productsPerPage,
        totalProducts: data.totalProducts,
        currentPage: pageNum ? pageNum : 1
    });

    filterEvents({
        sortOptions: data.sort,
        sort,
        includeSectionFilter
    });

    const productContainer = document.querySelector('.product-grid');

    renderProducts({ productContainer, products: results });
})();