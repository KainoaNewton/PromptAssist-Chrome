// Prompt Assist - Main script for adding improve button to AI chat inputs

// Base CSS for the improve button
PageModifier.injectCSS(`
  /* Only keep essential loader and utility styles */
  .button-image-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button-image-container svg {
    width: 100%;
    height: 100%;
  }

  /* Ensure images maintain aspect ratio */
  .button-image {
    max-width: 100%;
    height: auto;
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
	// Get SVG color or use default
	const svgColor = config.buttonSvgColor || '#ffffff';

	// Default SVG button to use if no image specified or as fallback
	const defaultSvgButton = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${svgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles-icon lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`;

	// Get custom image dimensions or use defaults
	const imageSize = config.buttonImageSize || 24;
	const aspectRatio = config.buttonImageAspectRatio || 1;
	const imageWidth = imageSize;
	const imageHeight = Math.round(imageSize * aspectRatio);

	if (config.buttonImage) {
		// Check if the image is an SVG
		if (config.buttonImage.endsWith('.svg')) {
			// Try to load SVG content synchronously
			const svgContent = PageModifier.loadSvgContentsSync(config.buttonImage);
			if (svgContent) {
				// Update SVG width, height and color if provided
				return svgContent
					.replace(
						/<svg([^>]*)>/,
						`<svg$1 width="${imageWidth}" height="${imageHeight}">`
					)
					.replace(/stroke="[^"]*"/g, `stroke="${svgColor}"`)
					.replace(/fill="[^"]*"/g, `fill="none"`);
			} else {
				// Fallback to default SVG if loading fails
				return defaultSvgButton.replace(
					/width="24" height="24"/,
					`width="${imageWidth}" height="${imageHeight}"`
				);
			}
		} else {
			// For non-SVG images, use the image tag with custom dimensions
			const imageUrl = chrome.runtime.getURL(config.buttonImage);
			return `<img src="${imageUrl}" class="button-image" width="${imageWidth}" height="${imageHeight}" />`;
		}
	}

	// Return default SVG if no button image specified, with custom dimensions
	return defaultSvgButton.replace(
		/width="24" height="24"/,
		`width="${imageWidth}" height="${imageHeight}"`
	);
}

// Add the improve button to input fields
function addImproveButtonToInput(inputElement) {
	const config = getCurrentWebsiteConfig();
	if (!config) return;

	// Find the closest button container by walking up the DOM tree
	const findButtonContainer = () => {
		console.log(
			'Debug - Looking for button container with selector:',
			config.buttonContainer.selector
		);

		// First try the direct parent elements
		let container = inputElement.closest(config.buttonContainer.selector);
		console.log('Debug - Container from closest:', !!container);

		if (!container) {
			// If not found in parents, try searching in siblings or nearby elements
			container = inputElement.parentElement?.querySelector(
				config.buttonContainer.selector
			);
			console.log('Debug - Container from parentElement:', !!container);
		}

		if (!container) {
			// If still not found, search in the entire form/chat area
			const chatArea = inputElement.closest(
				'form, [role="form"], [role="textbox"], .chat-area'
			);
			container = chatArea?.querySelector(config.buttonContainer.selector);
			console.log('Debug - Container from chatArea:', !!container);

			// Try a broader search if still not found
			if (!container) {
				console.log('Debug - Trying document-wide search for container');
				const possibleContainers = document.querySelectorAll(
					config.buttonContainer.selector
				);
				console.log(
					'Debug - Found possible containers:',
					possibleContainers.length
				);

				if (possibleContainers.length > 0) {
					// Find the closest container to our input element
					let closestContainer = null;
					let minDistance = Infinity;

					possibleContainers.forEach((possibleContainer) => {
						const rect1 = inputElement.getBoundingClientRect();
						const rect2 = possibleContainer.getBoundingClientRect();
						const distance = Math.sqrt(
							Math.pow(rect1.x - rect2.x, 2) + Math.pow(rect1.y - rect2.y, 2)
						);

						if (distance < minDistance) {
							minDistance = distance;
							closestContainer = possibleContainer;
						}
					});

					if (closestContainer) {
						console.log(
							'Debug - Found closest container at distance:',
							minDistance
						);
						container = closestContainer;
					}
				}
			}
		}

		// NEW FALLBACK: Try to find any container near the input element
		if (!container) {
			console.log('Debug - Trying proximity-based container search');
			try {
				// Get the input element's position
				const inputRect = inputElement.getBoundingClientRect();

				// Look for elements around the input (near the bottom-right corner)
				// This is where send buttons are typically located
				const rightEdge = inputRect.right - 50; // 50px from right edge
				const bottomEdge = inputRect.bottom - 10; // 10px from bottom

				// Try to find elements at this position
				let element = document.elementFromPoint(rightEdge, bottomEdge);
				console.log('Debug - Element at point:', element);

				if (element) {
					// Try to find a suitable container by walking up the DOM
					container = element.closest(
						'[class*="container"], [class*="wrapper"], [class*="toolbar"], [class*="button"]'
					);
					console.log('Debug - Proximity container found:', !!container);
				}
			} catch (e) {
				console.error('Error during proximity search:', e);
			}
		}

		// LAST RESORT: Create a container if none found
		if (!container) {
			console.log('Debug - Creating a container element');
			// Find the parent that contains the input
			const inputParent = inputElement.parentElement;

			// Create a new container
			container = document.createElement('div');
			container.className = 'prompt-assist-custom-container';
			container.style.cssText = `
				display: inline-flex;
				align-items: center;
				margin-right: 10px;
			`;

			// Insert it after the input element
			if (inputParent) {
				inputParent.insertAdjacentElement('beforeend', container);
				console.log('Debug - Created and inserted custom container');
			}
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

	// Check if API key exists and pass its status to the button creation function
	chrome.storage.local.get(['geminiApiKey'], (result) => {
		const hasApiKey = !!result.geminiApiKey;
		console.log('Debug - API key exists:', hasApiKey);
		addImproveButtonToContainer(container, inputElement, config, hasApiKey);
	});
}

// Helper function to add the button to a container
function addImproveButtonToContainer(
	container,
	inputElement,
	config,
	hasApiKey
) {
	const existingButton = container.querySelector('.prompt-assist-button');
	if (existingButton) {
		console.log('Debug - Button already exists');
		return;
	}

	// Create button
	const button = document.createElement('button');
	button.className = 'prompt-assist-button';
	button.innerHTML = getButtonContent(config);

	// Set default state based on API key availability
	if (!hasApiKey) {
		button.classList.add('disabled');
		button.title = 'Add API key in extension settings';
		button.style.cursor = 'not-allowed';
		button.disabled = true;
	} else {
		button.title = 'Input a prompt first'; // Default tooltip for when API key exists
	}

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

	// Apply custom image dimensions to button-image-container if specified
	const imageSize = config.buttonImageSize || 24;
	const aspectRatio = config.buttonImageAspectRatio || 1;
	const imageWidth = imageSize;
	const imageHeight = Math.round(imageSize * aspectRatio);

	const buttonImageContainer = button.querySelector('.button-image-container');
	if (buttonImageContainer) {
		buttonImageContainer.style.width = `${imageWidth}px`;
		buttonImageContainer.style.height = `${imageHeight}px`;
	}

	// Apply hover styles if defined in config
	if (config.buttonHoverStyles || config.buttonHoverSvgColor) {
		// Create a unique ID for this button
		const buttonId =
			button.id ||
			'prompt-assist-' + Math.random().toString(36).substring(2, 9);
		if (!button.id) button.id = buttonId;

		// Create a style tag with the hover styles
		const styleTag = document.createElement('style');

		// Apply all hover styles with !important to override base styles
		let hoverStyles = '';
		if (config.buttonHoverStyles) {
			hoverStyles = config.buttonHoverStyles
				.split(';')
				.filter((style) => style.trim())
				.map((style) => {
					// Check if the style already has !important
					if (style.includes('!important')) {
						return style;
					}
					// Add !important to the style if it doesn't have it
					const [property, value] = style.split(':').map((s) => s.trim());
					return `${property}: ${value} !important`;
				})
				.join('; ');
		}

		// Add SVG color change on hover if specified
		let svgHoverStyle = '';
		if (config.buttonHoverSvgColor) {
			svgHoverStyle = `
				#${buttonId}:hover:not(.disabled) svg {
					stroke: ${config.buttonHoverSvgColor} !important;
					color: ${config.buttonHoverSvgColor} !important;
				}
				#${buttonId}:hover:not(.disabled) svg path {
					stroke: ${config.buttonHoverSvgColor} !important;
					color: ${config.buttonHoverSvgColor} !important;
				}
			`;
		}

		// Apply only the styles from the config, no default outline or box-shadow
		styleTag.textContent = `
			#${buttonId}:hover:not(.disabled) {
				${hoverStyles};
			}
			${svgHoverStyle}
		`;
		document.head.appendChild(styleTag);

		console.log('Debug - Applied hover styles:', hoverStyles);
	}

	// Apply disabled styles if defined in config
	if (config.buttonDisabledStyles || config.buttonDisabledSvgColor) {
		const buttonId =
			button.id ||
			'prompt-assist-' + Math.random().toString(36).substring(2, 9);
		if (!button.id) button.id = buttonId;

		// Create or get the style tag
		let styleTag = document.getElementById(`${buttonId}-styles`);
		if (!styleTag) {
			styleTag = document.createElement('style');
			styleTag.id = `${buttonId}-styles`;
			document.head.appendChild(styleTag);
		}

		// Apply all disabled styles with !important to override base styles
		let disabledStyles = '';
		if (config.buttonDisabledStyles) {
			disabledStyles = config.buttonDisabledStyles
				.split(';')
				.filter((style) => style.trim())
				.map((style) => {
					// Check if the style already has !important
					if (style.includes('!important')) {
						return style;
					}
					// Add !important to the style if it doesn't have it
					const [property, value] = style.split(':').map((s) => s.trim());
					return `${property}: ${value} !important`;
				})
				.join('; ');
		}

		// Add SVG color change when disabled if specified
		let svgDisabledStyle = '';
		if (config.buttonDisabledSvgColor) {
			svgDisabledStyle = `
				#${buttonId}.disabled svg {
					stroke: ${config.buttonDisabledSvgColor} !important;
					color: ${config.buttonDisabledSvgColor} !important;
				}
				#${buttonId}.disabled svg path {
					stroke: ${config.buttonDisabledSvgColor} !important;
					color: ${config.buttonDisabledSvgColor} !important;
				}
			`;
		}

		// Add to the style tag
		styleTag.textContent += `
			#${buttonId}.disabled {
				${disabledStyles};
			}
			#${buttonId}.disabled:hover {
				${disabledStyles};
				outline: none !important;
				box-shadow: none !important;
			}
			${svgDisabledStyle}
		`;

		console.log('Debug - Applied disabled styles:', disabledStyles);
	}

	// Insert button in the appropriate position
	container.insertAdjacentElement(insertPosition, button);
	console.log('Debug - Button inserted with position:', insertPosition);

	// Add input event listener to update button state
	const updateButtonState = () => {
		// If there's no API key, keep button disabled regardless of input content
		if (!hasApiKey) {
			return;
		}

		let promptText = '';
		if (inputElement.tagName.toLowerCase() === 'textarea') {
			promptText = inputElement.value;
		} else if (inputElement.getAttribute('contenteditable') === 'true') {
			// Special handling for Gemini's contenteditable
			if (inputElement.classList.contains('ql-editor')) {
				// Get text directly from paragraphs
				promptText = Array.from(inputElement.querySelectorAll('p'))
					.map((p) => p.textContent || p.innerText)
					.join('\n')
					.trim();

				// If no paragraphs or empty, get the inner text directly
				if (!promptText) {
					promptText = inputElement.innerText || inputElement.textContent;
				}

				// Clean up any non-visible characters and check if truly empty
				promptText = promptText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
			} else {
				// For contenteditable divs, get text content from all child paragraphs
				promptText = Array.from(inputElement.children)
					.map((child) => child.textContent)
					.join('\n')
					.trim();
			}
		} else {
			promptText = inputElement.textContent || inputElement.innerText;
		}

		console.log(
			'Debug - Current prompt text length:',
			promptText.length,
			'Content:',
			promptText.substring(0, 20)
		);

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

	// Listen for input changes with more events for better reliability
	inputElement.addEventListener('input', updateButtonState);
	inputElement.addEventListener('change', updateButtonState);
	inputElement.addEventListener('keyup', updateButtonState);

	// For Gemini's special editor, watch for mutations as well
	if (inputElement.classList.contains('ql-editor')) {
		const observer = new MutationObserver(() => {
			setTimeout(updateButtonState, 10); // Small delay to let the DOM update
		});

		observer.observe(inputElement, {
			childList: true,
			subtree: true,
			characterData: true,
		});
	}

	// Add click handler
	button.addEventListener('click', async (e) => {
		if (button.disabled) {
			if (!hasApiKey) {
				// If clicked when disabled due to no API key, show the extension popup
				chrome.runtime.sendMessage({ action: 'showPopup' });
			}
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
	} else if (inputElement.getAttribute('contenteditable') === 'true') {
		// Special handling for Gemini's contenteditable
		if (inputElement.classList.contains('ql-editor')) {
			// Get text directly from paragraphs
			promptText = Array.from(inputElement.querySelectorAll('p'))
				.map((p) => p.textContent || p.innerText)
				.join('\n')
				.trim();

			// If no paragraphs or empty, get the inner text directly
			if (!promptText) {
				promptText = inputElement.innerText || inputElement.textContent;
			}
		} else {
			// For contenteditable divs, get text content from all child paragraphs
			promptText = Array.from(inputElement.children)
				.map((child) => child.textContent)
				.join('\n')
				.trim();
		}
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
		} else if (inputElement.getAttribute('contenteditable') === 'true') {
			// Special handling for Gemini's input
			if (inputElement.classList.contains('ql-editor')) {
				// Clear existing content
				inputElement.innerHTML = '';

				// Create paragraphs for each line
				const lines = result.enhancedPrompt.split('\n');
				lines.forEach((line) => {
					const p = document.createElement('p');
					p.textContent = line;
					inputElement.appendChild(p);
				});
			} else {
				// For contenteditable divs, create a new paragraph for each line
				const lines = result.enhancedPrompt.split('\n');
				inputElement.innerHTML = lines.map((line) => `<p>${line}</p>`).join('');
			}

			// Trigger input event to update UI
			inputElement.dispatchEvent(new Event('input', { bubbles: true }));
			inputElement.dispatchEvent(new Event('change', { bubbles: true }));

			// Extra event for Gemini
			const keyEvent = new KeyboardEvent('keydown', {
				key: ' ',
				code: 'Space',
				bubbles: true,
			});
			inputElement.dispatchEvent(keyEvent);
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

	// Add a function to log all possible text input elements on the page
	const logAllPossibleInputs = () => {
		console.log('Debug - Checking for all possible text inputs on the page:');

		// Check for standard textarea and input elements
		const textareas = document.querySelectorAll('textarea');
		console.log('Debug - Found textareas:', textareas.length);

		// Check for contenteditable elements
		const contenteditables = document.querySelectorAll(
			'[contenteditable="true"]'
		);
		console.log(
			'Debug - Found contenteditable elements:',
			contenteditables.length
		);

		// Check for elements with role=textbox
		const textboxes = document.querySelectorAll('[role="textbox"]');
		console.log('Debug - Found role=textbox elements:', textboxes.length);

		// List all textbox elements
		if (textboxes.length > 0) {
			console.log('Debug - Details of textbox elements:');
			textboxes.forEach((el, i) => {
				console.log(`Debug - Textbox ${i}:`, {
					id: el.id,
					class: el.className,
					contentEditable: el.contentEditable,
					attributes: Array.from(el.attributes)
						.map((attr) => `${attr.name}="${attr.value}"`)
						.join(', '),
				});
			});
		}

		// List all contenteditable elements
		if (contenteditables.length > 0) {
			console.log('Debug - Details of contenteditable elements:');
			contenteditables.forEach((el, i) => {
				console.log(`Debug - Contenteditable ${i}:`, {
					id: el.id,
					class: el.className,
					role: el.getAttribute('role'),
					attributes: Array.from(el.attributes)
						.map((attr) => `${attr.name}="${attr.value}"`)
						.join(', '),
				});
			});
		}
	};

	// Log all possible input elements initially
	setTimeout(logAllPossibleInputs, 1000);

	// Check for API key
	chrome.storage.local.get(['geminiApiKey'], (result) => {
		const hasApiKey = !!result.geminiApiKey;

		// Check existing elements
		let foundInputs = false;
		config.inputSelectors.forEach((selector) => {
			console.log('Debug - Checking selector:', selector);
			const elements = document.querySelectorAll(selector);
			console.log('Debug - Found elements:', elements.length);
			if (elements.length > 0) {
				foundInputs = true;
			}
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
				// Check current API key status before adding new buttons
				chrome.storage.local.get(['geminiApiKey'], (result) => {
					const hasApiKey = !!result.geminiApiKey;

					let foundInputsInMutation = false;
					config.inputSelectors.forEach((selector) => {
						console.log('Debug - Checking selector (mutation):', selector);
						const elements = document.querySelectorAll(selector);
						console.log('Debug - Found elements (mutation):', elements.length);
						if (elements.length > 0) {
							foundInputsInMutation = true;
						}
						elements.forEach((element) => {
							addImproveButtonToInput(element);
						});
					});

					// Periodically check for all input elements
					setTimeout(logAllPossibleInputs, 500);
				});
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}

// Handle API key changes
function handleApiKeyChange(changes) {
	if (changes.geminiApiKey) {
		const config = getCurrentWebsiteConfig();
		if (!config) return;

		const hasApiKey = !!changes.geminiApiKey.newValue;
		console.log('Debug - API key ' + (hasApiKey ? 'added' : 'removed'));

		// Find all existing prompt-assist buttons and update their state
		document.querySelectorAll('.prompt-assist-button').forEach((button) => {
			if (!hasApiKey) {
				// No API key, disable and gray out all buttons
				button.classList.add('disabled');
				button.title = 'Add API key in extension settings';
				button.style.cursor = 'not-allowed';
				button.disabled = true;
			} else {
				// API key added, buttons should be enabled based on input content
				const inputElement = findAssociatedInput(button, config);
				if (inputElement) {
					// Check if there's text in the input
					let hasText = false;
					if (inputElement.tagName.toLowerCase() === 'textarea') {
						hasText = !!inputElement.value.trim();
					} else if (inputElement.getAttribute('contenteditable') === 'true') {
						hasText = !!(
							inputElement.textContent || inputElement.innerText
						).trim();
					} else {
						hasText = !!(
							inputElement.textContent || inputElement.innerText
						).trim();
					}

					if (hasText) {
						// Enable button if input has text
						button.classList.remove('disabled');
						button.title = 'Improve your prompt with AI';
						button.style.cursor = 'pointer';
						button.disabled = false;
					} else {
						// Disable button if input is empty
						button.classList.add('disabled');
						button.title = 'Input a prompt first';
						button.style.cursor = 'not-allowed';
						button.disabled = true;
					}
				}
			}
		});

		// If API key was added or already exists, check for inputs that don't have buttons yet
		if (hasApiKey) {
			config.inputSelectors.forEach((selector) => {
				const elements = document.querySelectorAll(selector);
				elements.forEach((element) => {
					addImproveButtonToInput(element);
				});
			});
		}
	}
}

// Helper function to find the input element associated with a button
function findAssociatedInput(button, config) {
	// First try to find the closest container that might contain the input
	let container =
		button.closest('.prompt-assist-custom-container') || button.parentElement;

	if (!container) return null;

	// Check all possible input selectors
	for (const selector of config.inputSelectors) {
		// Try to find the input in nearby elements
		let input = container.querySelector(selector);

		// If not found, try looking in parent containers
		if (!input) {
			const parentForm = container.closest('form');
			if (parentForm) {
				input = parentForm.querySelector(selector);
			}
		}

		// If not found, try looking in the broader context
		if (!input) {
			// Find all inputs matching the selector
			const allInputs = document.querySelectorAll(selector);

			// If only one found, that's probably it
			if (allInputs.length === 1) {
				input = allInputs[0];
			} else if (allInputs.length > 1) {
				// If multiple, find the closest one by DOM proximity
				let closestInput = null;
				let closestDistance = Infinity;

				allInputs.forEach((possibleInput) => {
					// Calculate DOM "distance" (number of steps between elements)
					let distance = 0;
					let current = button;
					let common = null;

					// Find common ancestor
					while (current && !common) {
						let ancestor = possibleInput;
						let depth = 0;

						while (ancestor && ancestor !== current) {
							ancestor = ancestor.parentElement;
							depth++;
						}

						if (ancestor === current) {
							common = ancestor;
							distance = depth;
							break;
						}

						current = current.parentElement;
						distance++;
					}

					if (common && distance < closestDistance) {
						closestDistance = distance;
						closestInput = possibleInput;
					}
				});

				input = closestInput;
			}
		}

		if (input) return input;
	}

	return null;
}

// Listen for API key changes
chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === 'local') {
		handleApiKeyChange(changes);
	}
});

// Handle opening the popup UI when clicked on disabled button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'openOptionsPage') {
		chrome.runtime.openOptionsPage();
	}
});

// Start observing for chat inputs when the script loads
observeForChatInputs();
