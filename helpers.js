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
	elements.forEach((el) => el.remove());
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
	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
}

/**
 * Attaches a click event handler to elements matching the selector, even if added later.
 * @param {string} selector - CSS selector for elements
 * @param {function(Event): void} handler - Event handler
 */
function onClick(selector, handler) {
	document.addEventListener('click', (event) => {
		const target = event.target.closest(selector);
		if (target) {
			handler(event);
		}
	});
}

/**
 * Loads an SVG file and returns its contents as a string.
 * @param {string} svgPath - Path to the SVG file
 * @returns {Promise<string>} - Promise resolving to the SVG content as a string
 */
async function loadSvgContents(svgPath) {
	try {
		const response = await fetch(chrome.runtime.getURL(svgPath));
		if (!response.ok) {
			throw new Error(`Failed to load SVG: ${response.statusText}`);
		}
		return await response.text();
	} catch (error) {
		console.error('Error loading SVG:', error);
		return null;
	}
}

/**
 * Loads an SVG file and returns its contents as a string synchronously.
 * @param {string} svgPath - Path to the SVG file
 * @returns {string|null} - SVG content as a string or null if loading fails
 */
function loadSvgContentsSync(svgPath) {
	try {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', chrome.runtime.getURL(svgPath), false); // false makes it synchronous
		xhr.send();

		if (xhr.status === 200) {
			return xhr.responseText;
		}
		return null;
	} catch (error) {
		console.error('Error loading SVG synchronously:', error);
		return null;
	}
}

// Expose functions globally
window.PageModifier = {
	injectCSS,
	addElement,
	removeElement,
	onElementReady,
	onClick,
	loadSvgContents,
	loadSvgContentsSync,
};
