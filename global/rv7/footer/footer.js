// Vanilla JS
// does not need an onload as long as it is included at the bottom of the page
(function() {
    var footers = document.getElementsByTagName('footer'),
        footer,
        htmlEl = document.documentElement,
        xhr = new XMLHttpRequest();

    // only add the global footer if the page doesn't already have it's own
    if (footers.length === 0) {
        // add the global footer class to the page, to add related styles
        htmlEl.classList.add("glblftr");
        footer = document.createElement('footer');
        document.body.append(footer);
    
        // when the HTML is ready inject it into the footer
        xhr.onreadystatechange = function () { 
            if (xhr.readyState == 4 && xhr.status == 200) {
                footer.innerHTML = xhr.responseText;
            }
        }
    
        // request the footer HTML
        xhr.open("GET", "/e2/global/rv7/footer/footer.html", true);
        xhr.setRequestHeader('Content-type', 'text/html');
        xhr.send();
    }

 })();

   // Adding DAP analytics script

   (function AddDAPScript() { 
    var script   = document.createElement("script");
    script.type  = "text/javascript";
    script.async = "true";
    script.id  = "_fed_an_ua_tag";
    script.src   = "https://dap.digitalgov.gov/Universal-Federated-Analytics-Min.js?agency=DOD&subagency=Army&platform=static";
    document.body.appendChild(script);
})();