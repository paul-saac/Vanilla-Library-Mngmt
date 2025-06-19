 const routes = {
  "/dashboard": "pages/dashboard/dashboard.html",
  "/books": "pages/books/books.html",
  "/members": "pages/members/members.html",
  "/issue": "pages/issue/issue.html",
  "/logbook": "pages/logbook/logbook.html",
  "/settings": "pages/settings/settings.html"
};

function router() {
  const hash = window.location.hash || "#/";
  const path = hash.slice(1);
  loadContent(path);
}

function loadContent(path) {
  const file = routes[path] || "views/404.html";

  fetch(file)
    .then(res => res.text()) /* fetch first .then will always be referring to RESPONSE OBJECT and 
    then returning the text() method that reads the response body as a plain text string.
    WHICH IS: for example in 
    
    views/about/about.html
    
    THE ABOUT.HTML FILE HAS
    <h2>About Us</h2>
    <p>This is the about page.</p>  
    
    THEN IT WILL RETURN
    "<h2>About Us</h2>\n<p>This is the about page.</p>"
    | .text() just returns that portion — because that’s all that’s inside the file.
    
    MEANING IF ABOUT.HTML FILE HAS ALL DOCTYPE AND SHITS IT WILL RETURN THE WHOLE AS A STRING
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <title>About</title>\n</head>\n<body>\n  <h2>About Page</h2>\n  <p>This is the About section.</p>\n</body>\n</html>"
    */
    .then(html => { // THE .TEXT() RETURNS BECOMES THE HTML WHICH IS NOW WILL STORE IN INNERHTML OF ELEMENT OF APP
        document.getElementById("app").innerHTML = html;
        loadAssets(path);
    });
}

function loadAssets(path) {
  // Determine section name (e.g., "dashboard" from "/dashboard")
  const section = path === "/" ? "home" : path.replace("/", "");
  // Set base path for assets (e.g., "pages/dashboard/")
  const basePath = `pages/${section}/`;

  // Load per-page CSS
  const cssId = `${section}-css`;
  if (!document.getElementById(cssId)) {
    const css = document.createElement("link");
    css.id = cssId;
    css.rel = "stylesheet";
    css.href = `${basePath}${section}.css`;
    document.head.appendChild(css);
  }

  // Load per-page JS
  const jsId = `${section}-js`;
  if (!document.getElementById(jsId)) {
    const js = document.createElement("script");
    js.id = jsId;
    js.src = `${basePath}${section}.js`;
    document.body.appendChild(js);
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

