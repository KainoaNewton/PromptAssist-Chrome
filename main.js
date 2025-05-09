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

  /* Loading State */
  .prompt-assist-loader {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
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
	if (config.buttonImage) {
		const imageUrl = chrome.runtime.getURL(config.buttonImage);
		return `<img src="${imageUrl}" alt="Improve" class="button-image" />`;
	}
	return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 16 16" class="button-image">
    <path d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z" fill="#ffffff"/>
    <path d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z" fill="#ffffff"/>
    <path d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z" fill="#ffffff"/>
  </svg>`;
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

	// Show loading state
	const originalText = button.textContent;
	button.innerHTML = '<span class="prompt-assist-loader"></span>Improving...';
	button.disabled = true;

	try {
		// Call Gemini API to improve the prompt
		const result = await window.GeminiAPI.improvePrompt(promptText);

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

		// Reset button
		button.innerHTML = 'Improved!';
		setTimeout(() => {
			button.textContent = originalText;
			button.disabled = false;
		}, 2000);
	} catch (error) {
		console.error('Error improving prompt:', error);
		button.innerHTML = 'Error';
		button.title = error.message;

		setTimeout(() => {
			button.textContent = originalText;
			button.disabled = false;
		}, 2000);
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
