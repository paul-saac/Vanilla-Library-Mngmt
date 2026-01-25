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


async function loadAssets(path) {
  const section = path === "/" ? "dashboard" : path.slice(1);
  const basePath = `pages/${section}/`;

  // Remove only per-route assets added by the router (do NOT touch global.css)
  document.querySelectorAll('link[data-route-css="1"]').forEach((l) => l.remove());
  document.querySelectorAll('script[data-route-js="1"]').forEach((s) => s.remove());

  // Page CSS (skip if missing to avoid 404 noise)
  const cssUrl = new URL(`${basePath}${section}.css`, window.location.href);
  try {
    const cssHead = await fetch(cssUrl, { method: "HEAD" });
    if (cssHead.ok) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = cssUrl.toString();
      css.setAttribute("data-route-css", "1");
      document.head.appendChild(css);
    }
  } catch {
    // ignore
  }

  // Page JS (skip if missing to avoid 404 noise)
  const jsUrl = new URL(`${basePath}${section}.js`, window.location.href);
  try {
    const jsHead = await fetch(jsUrl, { method: "HEAD" });
    if (jsHead.ok) {
      const js = document.createElement("script");
      js.type = "module";
      js.src = jsUrl.toString();
      js.setAttribute("data-route-js", "1");
      document.body.appendChild(js);
    }
  } catch {
    // ignore
  }
}


window.addEventListener("hashchange", router);
window.addEventListener("load", router);
