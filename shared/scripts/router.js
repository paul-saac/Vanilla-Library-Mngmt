const routes = {
  "/": "pages/dashboard/dashboard.html",
  "/books": "pages/books/books.html",
  "/students": "pages/students/students.html",
  "/issue": "pages/issue/issue.html",
  "/logbook": "pages/logbook/logbook.html",
  "/settings": "pages/settings/settings.html"
};

function router() {
  const hash = window.location.hash || "#/";
  const path = hash.startsWith("#/") ? hash.slice(1) : "/";
  loadContent(path);
  Navtitle(path);
}

function Navtitle(path) {
  const navtitle = document.getElementById('nav-title');

  switch (path) {
    case "/":
      navtitle.textContent = "Dashboard";
      break;
    case "/books":
      navtitle.textContent = "Books";
      break;
    case "/students":
      navtitle.textContent = "Students";
      break;
    case "/issue":
      navtitle.textContent = "Issue Books";
      break;
    case "/logbook":
      navtitle.textContent = "Log Book";
      break;
    case "/settings":
      navtitle.textContent = "Settings";
      break;

    default:
    // code bloc
  }
}

function loadContent(path) {
  
  const file = routes[path] || "pages/dashboard/dashboard.html";

  fetch(file)
    .then(res => res.text()) /* fetch first .then will always be referring to RESPONSE OBJECT and 
    then returning the text() method that reads the response body as a plain text string.
    WHICH IS: for example in pages/dashboard/dashboard.html
    
    THE dashboard.html FILE HAS
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
  const section = path === "/" ? "dashboard" : path.slice(1);

  // Set base path for assets (e.g., "pages/dashboard/")
  const basePath = `pages/${section}/`;

  // Remove all per-page CSS stylesheets
  const allCssLinks = document.querySelectorAll('link[id$="-css"]');
  allCssLinks.forEach(link => link.remove());

  // Load per-page CSS
  const cssId = `${section}-css`;
  const css = document.createElement("link");
  css.id = cssId;
  css.rel = "stylesheet";
  css.href = `${basePath}${section}.css`;
  document.head.appendChild(css);

  // Load per-page JS
  const jsId = `${section}-js`;
  const existingScript = document.getElementById(jsId);
  if (existingScript) {
    existingScript.remove(); // Remove old script to allow re-execution
  }

  const js = document.createElement("script");
  js.id = jsId;
  js.type = "module"; // Add this line to enable ES6 imports
  js.src = `${basePath}${section}.js`;
  document.body.appendChild(js);
}


window.addEventListener("hashchange", router);
window.addEventListener("load", router);
