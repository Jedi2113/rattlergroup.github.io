// Global site tag (gtag.js) - Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
// the Army.mil UA and GA4 codes
gtag('config', 'UA-27189539-1');
gtag('config', 'G-YQMQPQYJ4J');

// finds any other GA codes found in the markup and adds them
var codeEl = document.getElementById('ga-analytic-codes');
var codes = (codeEl && codeEl.dataset.codes) ? codeEl.dataset.codes.split(',') : [];
for (var i = 0; i < codes.length; i++) {
  var cleanCode = codes[i].trim();
  // do not duplicate the default Army.mil codes
  if (cleanCode !== 'UA-27189539-1' && cleanCode !== 'G-YQMQPQYJ4J') {
    // example: gtag('config', 'UA-27189539-1');
    gtag('config', cleanCode);
  }
}