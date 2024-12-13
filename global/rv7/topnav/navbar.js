// Vanilla JS
// does not need an onload as long as it is included at the bottom of the page
(function() {
    var glblnav = document.getElementById('globalnavcontainer'),
        wrapper = document.getElementsByClassName('wrapper'),
        xhr = new XMLHttpRequest();

    // add global nav to page, if does not exist
    if (!glblnav) {
        glblnav = document.createElement('div');
        glblnav.id = "globalnavcontainer";
        document.body.prepend(glblnav);
    }
    // adjust page for nav
    for (var i = 0; i < wrapper.length; i++) {
        wrapper[i].classList.add('globalnavisloaded');
    }
    
    // when the HTML is ready inject it into the navbar
    xhr.onreadystatechange = function () { 
        if (xhr.readyState == 4 && xhr.status == 200) {
            glblnav.innerHTML = xhr.responseText;
        }
    }

    // request the footer HTML
    xhr.open("GET", "/e2/global/rv7/topnav/navbar.html", true);
    xhr.setRequestHeader('Content-type', 'text/html');
    xhr.send();

 })();

 // Checks and changes navbar label link if desired, default is 'index.html' 
 
 window.addEventListener("load", (event) => {
    var featuresLabelLink = document.getElementById("featureslabelink");
    var dataExists = document.getElementById("globalnavbarlabellink");
    if (dataExists) {
    var flLinkLocation = document.getElementById("globalnavbarlabellink").getAttribute('data-labellink');
    featuresLabelLink.setAttribute('href', flLinkLocation);
    } else {};
});

// global search bar - passes query to search.gov

window.addEventListener("load", (event) => {
    const form = document.getElementById('govsearch_form');
    form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const formData = new FormData(form);
        const params = new URLSearchParams(formData);
        console.log(params.toString());
        var searchquery = params.toString();
        var posturl = "https://search.usa.gov/search?utf8=%E2%9C%93&affiliate=www.army.mil&";
        window.location.href = posturl + searchquery;
    });
});