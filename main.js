// Prompt Assist - Main script for adding improve button to AI chat inputs

// Base CSS for the improve button
PageModifier.injectCSS(`
  .prompt-assist-button {
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    z-index: 1000;
    background: none;
    border: none;
    padding: 7px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .prompt-assist-button:hover {
    background-color: #18181B !important;
  }

  .prompt-assist-button.disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
    background-color: #4a4a4a !important;
  }

  .prompt-assist-button.disabled:hover {
    background-color: #4a4a4a !important;
  }

  /* Button image container for SVGs */
  .button-image-container {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button-image-container svg {
    width: 100%;
    height: 100%;
  }

  /* Loading State */
  .prompt-assist-loader {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    border-top-color: #FFFFFF;
    animation: prompt-assist-spin 1s linear infinite;
  }
  
  @keyframes prompt-assist-spin {
    to { transform: rotate(360deg); }
  }
`);

// Helper function to create button content
function getButtonContent(config) {
	// Default SVG button to use if no image specified or as fallback
	const defaultSvgButton = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles-icon lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`;

	if (config.buttonImage) {
		// Check if the image is an SVG
		if (config.buttonImage.endsWith('.svg')) {
			// Try to load SVG content synchronously
			const svgContent = PageModifier.loadSvgContentsSync(config.buttonImage);
			if (svgContent) {
				return svgContent;
			} else {
				// Fallback to default SVG if loading fails
				return defaultSvgButton;
			}
		} else {
			// For non-SVG images, use the image tag
			const imageUrl = chrome.runtime.getURL(config.buttonImage);
			return `<img src="${imageUrl}" class="button-image" />`;
		}
	}

	// Return default SVG if no button image specified
	return defaultSvgButton;
}

// Add the improve button to input fields
function addImproveButtonToInput(inputElement) {
	const config = getCurrentWebsiteConfig();
	if (!config) return;

	// Check if API key exists before proceeding
	chrome.storage.local.get(['geminiApiKey'], (result) => {
		if (!result.geminiApiKey) {
			console.log('Debug - No API key found, not adding improve button');
			return;
		}

		// Find the closest button container by walking up the DOM tree
		const findButtonContainer = () => {
			// First try the direct parent elements
			let container = inputElement.closest(config.buttonContainer.selector);

			if (!container) {
				// If not found in parents, try searching in siblings or nearby elements
				container = inputElement.parentElement?.querySelector(
					config.buttonContainer.selector
				);
			}

			if (!container) {
				// If still not found, search in the entire form/chat area
				const chatArea = inputElement.closest(
					'form, [role="form"], [role="textbox"], .chat-area'
				);
				container = chatArea?.querySelector(config.buttonContainer.selector);
			}

			return container;
		};

		// Check if button already exists
		const container = findButtonContainer();
		console.log('Debug - Found button container:', !!container);

		if (!container) {
			console.log(
				'Debug - Button container not found for selector:',
				config.buttonContainer.selector,
				'- Will retry on DOM changes'
			);

			// Set up a mutation observer to watch for the container being added
			const observer = new MutationObserver((mutations, obs) => {
				const newContainer = findButtonContainer();
				if (newContainer) {
					obs.disconnect();
					addImproveButtonToContainer(newContainer, inputElement, config);
				}
			});

			// Observe the chat area or form for changes
			const chatArea =
				inputElement.closest(
					'form, [role="form"], [role="textbox"], .chat-area'
				) || document.body;
			observer.observe(chatArea, {
				childList: true,
				subtree: true,
			});

			return;
		}

		addImproveButtonToContainer(container, inputElement, config);
	});
}

// Helper function to add the button to a container
function addImproveButtonToContainer(container, inputElement, config) {
	const existingButton = container.querySelector('.prompt-assist-button');
	if (existingButton) {
		console.log('Debug - Button already exists');
		return;
	}

	// Create button
	const button = document.createElement('button');
	button.className = 'prompt-assist-button';
	button.innerHTML = getButtonContent(config);
	button.title = 'Input a prompt first'; // Default tooltip

	// Set position attribute for CSS styling
	const insertPosition = config.buttonContainer.insertPosition;
	button.setAttribute('data-position', insertPosition);
	console.log('Debug - Setting button position:', insertPosition);

	// Apply button styles from config
	if (config.buttonStyles) {
		// Convert CSS string to style object
		const styles = config.buttonStyles
			.split(';')
			.filter((style) => style.trim())
			.reduce((acc, style) => {
				const [property, value] = style.split(':').map((s) => s.trim());
				if (property && value) {
					// Convert kebab-case to camelCase
					const camelProperty = property.replace(/-([a-z])/g, (g) =>
						g[1].toUpperCase()
					);
					acc[camelProperty] = value;
				}
				return acc;
			}, {});

		Object.assign(button.style, styles);
	}

	// Insert button in the appropriate position
	container.insertAdjacentElement(insertPosition, button);
	console.log('Debug - Button inserted with position:', insertPosition);

	// Add input event listener to update button state
	const updateButtonState = () => {
		let promptText = '';
		if (inputElement.tagName.toLowerCase() === 'textarea') {
			promptText = inputElement.value;
		} else {
			promptText = inputElement.textContent || inputElement.innerText;
		}

		if (!promptText.trim()) {
			button.classList.add('disabled');
			button.title = 'Input a prompt first';
			button.style.cursor = 'not-allowed';
			button.disabled = true;
		} else {
			button.classList.remove('disabled');
			button.title = 'Improve your prompt with AI';
			button.style.cursor = 'pointer';
			button.disabled = false;
		}
	};

	// Initial state
	updateButtonState();

	// Listen for input changes
	inputElement.addEventListener('input', updateButtonState);
	inputElement.addEventListener('change', updateButtonState);

	// Add click handler
	button.addEventListener('click', async (e) => {
		if (button.disabled) {
			e.preventDefault();
			return;
		}
		await improvePrompt(inputElement, button);
	});
}

// Handle improving the prompt
async function improvePrompt(inputElement, button) {
	// Get current prompt text
	let promptText;
	if (inputElement.tagName.toLowerCase() === 'textarea') {
		promptText = inputElement.value;
	} else {
		promptText = inputElement.textContent || inputElement.innerText;
	}

	if (!promptText.trim()) {
		return; // No need for alert since button will be disabled
	}

	// Store original button content
	const originalContent = button.innerHTML;

	// Show loading state with animated circular loader icon
	button.innerHTML =
		'<div class="button-image-container"><span class="prompt-assist-loader"></span></div>';
	button.disabled = true;

	try {
		// Call Gemini API to improve the prompt
		const result = await window.GeminiAPI.improvePrompt(promptText);

		// Debug log to see what we got back
		console.log('Debug - API response:', result);
		console.log('Debug - Enhanced prompt:', result.enhancedPrompt);
		console.log('Debug - Analysis:', result.analysis);

		// Check if we got a valid response
		if (!result.enhancedPrompt) {
			console.error('Empty enhanced prompt received from API');
			throw new Error('Received empty response from AI');
		}

		// Update input with improved prompt
		if (inputElement.tagName.toLowerCase() === 'textarea') {
			inputElement.value = result.enhancedPrompt;
			// Trigger input event to update UI
			inputElement.dispatchEvent(new Event('input', { bubbles: true }));
		} else {
			inputElement.textContent = result.enhancedPrompt;
			// Trigger input event to update UI
			inputElement.dispatchEvent(new Event('input', { bubbles: true }));
		}

		// Show success SVG
		const doneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
		button.innerHTML = `<div class="button-image-container">${doneSvg}</div>`;

		// Reset button after delay
		setTimeout(() => {
			button.innerHTML = originalContent;
			button.disabled = false;
		}, 2000);
	} catch (error) {
		console.error('Error improving prompt:', error);

		// Embed error SVG directly (with red fill)
		const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-octagon-alert-icon lucide-octagon-alert"><path d="M12 16h.01"/><path d="M12 8v4"/><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/></svg>`;

		button.innerHTML = `<div class="button-image-container">${errorSvg}</div>`;
		button.title = error.message;

		setTimeout(() => {
			button.innerHTML = originalContent;
			button.disabled = false;
		}, 2000); // Changed to 3 seconds
	}
}

// Observe the DOM for chat input elements
function observeForChatInputs() {
	const config = getCurrentWebsiteConfig();
	if (!config) {
		console.log('Debug - No config found for this website');
		return;
	}
	console.log('Debug - Using config:', config);

	// Check existing elements
	config.inputSelectors.forEach((selector) => {
		console.log('Debug - Checking selector:', selector);
		const elements = document.querySelectorAll(selector);
		console.log('Debug - Found elements:', elements.length);
		elements.forEach((element) => {
			addImproveButtonToInput(element);
		});
	});

	// Observe for new elements
	const observer = new MutationObserver((mutations) => {
		let shouldCheck = false;

		mutations.forEach((mutation) => {
			if (mutation.addedNodes.length > 0) {
				shouldCheck = true;
			}
		});

		if (shouldCheck) {
			config.inputSelectors.forEach((selector) => {
				console.log('Debug - Checking selector (mutation):', selector);
				const elements = document.querySelectorAll(selector);
				console.log('Debug - Found elements (mutation):', elements.length);
				elements.forEach((element) => {
					addImproveButtonToInput(element);
				});
			});
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
}

// Handle API key changes
function handleApiKeyChange(changes) {
	if (changes.geminiApiKey) {
		const config = getCurrentWebsiteConfig();
		if (!config) return;

		if (!changes.geminiApiKey.newValue) {
			// API key was removed, remove all improve buttons
			document.querySelectorAll('.prompt-assist-button').forEach((button) => {
				button.remove();
			});
		} else {
			// API key was added, check for inputs and add buttons
			config.inputSelectors.forEach((selector) => {
				const elements = document.querySelectorAll(selector);
				elements.forEach((element) => {
					addImproveButtonToInput(element);
				});
			});
		}
	}
}

// Listen for API key changes
chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === 'local') {
		handleApiKeyChange(changes);
	}
});

// Start observing for chat inputs when the script loads
observeForChatInputs();
