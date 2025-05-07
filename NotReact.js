function tag(name, ...children) {
  const result = document.createElement(name);
  for (const child of children) {
    if (child === null || child === undefined) continue;
    else if (typeof (child) === 'string') result.appendChild(document.createTextNode(child));
    else if (typeof (child) === 'function') child(result); // Support for component nesting
    else result.appendChild(child);
  }
  result.att$ = function (name, value) { this.setAttribute(name, value); return this; };
  result.style$ = function (styles) { Object.assign(this.style, styles); return this; }; // Better styling
  result.on$ = function (event, callback) { this.addEventListener(event, callback); return this; }; // Better events
  return result;
}
const MUNDANE_TAGS = ["canvas", "h1", "h2", "h3", "h4", "h5", "p", "a", "div", "span", "select", "button", "ul", "li"];
for (let tagName of MUNDANE_TAGS) window[tagName] = (...children) => tag(tagName, ...children);
function img(src) { return tag("img").att$("src", src); }
function input(type, value = '') { return tag("input").att$("type", type).att$("value", value); }
// Simple State Management
function createState(initialState) {
  let state = initialState;
  const listeners = [];
  return {
    get: () => state,
    set: (newState) => { state = typeof newState === 'function' ? newState(state) : newState; listeners.forEach(l => l(state)); },
    subscribe: (listener) => { listeners.push(listener); return () => listeners.filter(l => l !== listener); }
  };
}
function router(routes) {
  let result = div();
  const getRoute = () => {
    let hashLocation = document.location.hash.split('#')[1] || '/';
    return hashLocation in routes ? hashLocation : '/404';
  };
  function syncHash() {
    const hashLocation = getRoute();
    result.replaceChildren(routes[hashLocation]());
    return result;
  };
  syncHash();
  const listener = () => syncHash();
  window.addEventListener("hashchange", listener);
  result.unmount = () => window.removeEventListener("hashchange", listener); // Clean up
  result.refresh = syncHash;
  return result;
}
