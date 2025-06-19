 const routes = {
  "/home": "views/home/home.html",
  "/about": "views/about/about.html",
  "/contact": "views/contact/contact.html"
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

function loadAssets(path) { //loadAssests(views/about/about.html)
  const section = path === "/" ? "home" : path.replace("/", "");
  const basePath = `views/${section}/`;

  // Load per-page CSS
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = `${basePath}${section}.css`;
  document.head.appendChild(css);

  // Load per-page JS
  const js = document.createElement("script");
  js.src = `${basePath}${section}.js`;
  document.body.appendChild(js);
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

