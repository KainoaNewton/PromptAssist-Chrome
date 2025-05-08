// Helpers for page modification
// ----------------------------

/**
 * Injects CSS styles into the page by appending a <style> block to <head>.
 * @param {string} css - CSS rules to inject
 */
function injectCSS(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Adds an HTML snippet inside the first element matching the selector.
 * @param {string} selector - CSS selector for the parent element
 * @param {string} html - HTML string to insert
 */
function addElement(selector, html) {
  const parent = document.querySelector(selector);
  if (parent) {
    parent.insertAdjacentHTML('beforeend', html);
  }
}

/**
 * Removes all elements matching the selector from the page.
 * @param {string} selector - CSS selector for elements to remove
 */
function removeElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => el.remove());
}

/**
 * Waits for an element to appear in the DOM, then calls the callback.
 * @param {string} selector - CSS selector for the target element
 * @param {function(Element): void} callback - Called with the found element
 */
function onElementReady(selector, callback) {
  const existing = document.querySelector(selector);
  if (existing) {
    callback(existing);
    return;
  }
  const observer = new MutationObserver((mutations, obs) => {
    const el = document.querySelector(selector);
    if (el) {
      obs.disconnect();
      callback(el);
    }
  });
  observer.observe(document.documentElement, {childList: true, subtree: true});
}

/**
 * Attaches a click event handler to elements matching the selector, even if added later.
 * @param {string} selector - CSS selector for elements
 * @param {function(Event): void} handler - Event handler
 */
function onClick(selector, handler) {
  document.addEventListener('click', event => {
    const target = event.target.closest(selector);
    if (target) {
      handler(event);
    }
  });
}

// Expose functions globally
window.PageModifier = {
  injectCSS,
  addElement,
  removeElement,
  onElementReady,
  onClick
}; 