// Configuration for supported websites
const WEBSITE_CONFIGS = {
	// This is an example, but it does actually work
	'demo.chat-sdk.dev/*': {
		// Optional: Custom button image
		buttonImage: '',

		// Optional: Custom button image size (default 24px)
		buttonImageSize: 22,
		// Optional: Aspect ratio for height (height = size * aspectRatio, default 1)
		buttonImageAspectRatio: 1,

		// Optional: SVG colors for different states
		buttonSvgColor: '#FFFFFF', // Normal state SVG color
		buttonHoverSvgColor: '#FFFFFF', // Hover state SVG color
		buttonDisabledSvgColor: '#AAAAAA', // Disabled state SVG color

		// Input field selectors (you only need 1 but its good to have backups, top is used first)
		inputSelectors: [
			'#multimodal-input',
			'textarea[placeholder*="Send a message..."]',
			'textarea[rows="2"]',
		],

		// Button configuration
		buttonContainer: {
			selector:
				'.absolute.bottom-0.right-0.p-2.w-fit.flex.flex-row.justify-end', // Selector for the container of the button
			// inside-start: inside the container, before the first child
			// inside-end: inside the container, after the last child
			// outside-before: before the container
			// outside-after: after the container
			insertPosition: 'inside-start', // Position of the button relative to the selected container
		},

		// Button styles in CSS format
		buttonStyles: `
			/* Base button styles */
			position: relative;
			z-index: 1000;
			background: none;
			border: none !important;
			border-color: transparent !important;

			cursor: pointer;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 30px;
			height: 30px;
			margin-right: 8px;
		`,

		// Button hover styles in CSS format (applied when hovering)
		buttonHoverStyles: `
			background-color: #18181B;
			border: none !important;
			border-color: transparent !important;
			outline: none !important;
			box-shadow: none !important;
		`,

		// Button disabled styles in CSS format (applied when button is disabled/inactive)
		buttonDisabledStyles: `
			opacity: 0.5;
			cursor: not-allowed !important;
			background-color: transparent !important;
			border-color: transparent !important;
			outline: none !important;
			border: none !important;
		`,
	},
	'chatgpt.com/*': {
		// Optional: Custom button image
		buttonImage: '',

		// Optional: Custom button image size (default 24px)
		buttonImageSize: 18,
		// Optional: Aspect ratio for height (height = size * aspectRatio, default 1)
		buttonImageAspectRatio: 1,

		// Optional: SVG colors for different states
		buttonSvgColor: '#FFFFFF', // Normal state SVG color
		buttonDisabledSvgColor: '#6B6B6B', // Disabled state SVG color

		// Input field selectors (you only need 1 but its good to have backups, top is used first)
		inputSelectors: [
			'#prompt-textarea.ProseMirror[contenteditable="true"]',
			'div[contenteditable="true"]#prompt-textarea',
		],

		// Button configuration
		buttonContainer: {
			selector: '.absolute.end-3.bottom-0.flex.items-center.gap-2',
			insertPosition: 'inside-start', // Position of the button relative to the selected container
		},

		// Button styles in CSS format
		buttonStyles: `
			/* Base button styles */
			position: relative;
			z-index: 1000;
			background: none;
			border: 1px solid #4F4F4F;
			cursor: pointer;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 36px;
			height: 36px;
		`,

		// Button hover styles in CSS format (applied when hovering)
		buttonHoverStyles: `
			border-color: #6B6B6B !important;
			outline: none !important;
			box-shadow: none !important;
		`,

		// Button disabled styles in CSS format (applied when button is disabled/inactive)
		buttonDisabledStyles: `
			cursor: not-allowed !important;
			border-color: #393939 !important;
			background-color: transparent !important;
			opacity: 1 !important;
			outline: none !important;
		`,
	},
	'gemini.google.com/*': {
		// Optional: Custom button image
		buttonImage: '',

		// Optional: Custom button image size (default 24px)
		buttonImageSize: 20,
		// Optional: Aspect ratio for height (height = size * aspectRatio, default 1)
		buttonImageAspectRatio: 1,

		// Optional: SVG colors for different states
		buttonSvgColor: '#9A9B9C', // Normal state SVG color
		buttonHoverSvgColor: '#FFFFFF', // Hover state SVG color

		// Updated input field selectors based on actual console logs
		inputSelectors: [
			'.ql-editor.textarea.new-input-ui[contenteditable="true"]',
			'.ql-editor.textarea.new-input-ui',
			'.ql-editor[contenteditable="true"][role="textbox"]',
			'[contenteditable="true"][role="textbox"]',
			'div[role="textbox"][contenteditable="true"]',
		],

		// Button configuration with more targeted selectors
		buttonContainer: {
			selector:
				'.input-actions-container, ' +
				'.input-buttons-wrapper-bottom, ' +
				'.trailing-actions-wrapper, ' +
				'.new-input-ui-container, ' +
				'.ql-toolbar, ' +
				'.input-buttons',
			insertPosition: 'inside-start', // Place at the end of container
		},

		// Button styles in CSS format
		buttonStyles: `
			/* Base button styles */
			// cursor: pointer;
			border-radius: 50%;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: transparent;
			width: 42px;
			height: 42px;
			margin-right: 8px;
		`,

		// Button hover styles in CSS format (applied when hovering)
		buttonHoverStyles: `
			border: none;
			background-color: #262729;
			outline: none;
			box-shadow: none;
		`,

		// Button disabled styles in CSS format (applied when button is disabled/inactive)
		buttonDisabledStyles: `
			display: none;
		`,
	},
	'claude.ai/*': {
		// Optional: Custom button image size (default 24px)
		buttonImageSize: 16,

		// Optional: SVG colors for different states
		buttonSvgColor: '#C2C0B6', // Normal state SVG color

		// Input field selectors (you only need 1 but its good to have backups, top is used first)
		inputSelectors: [
			'div.ProseMirror[contenteditable="true"]',
			'div[contenteditable="true"][translate="no"]',
			'div[contenteditable="true"]',
		],

		// Button configuration
		buttonContainer: {
			// Target the main input container
			selector:
				'div.flex.gap-2\\.5.w-full.items-center, .flex.gap-2\\.5.w-full.items-center',
			insertPosition: 'inside-start', // Position the button after the container
		},

		// Button styles in CSS format
		buttonStyles: `
			/* Base button styles */
			position: relative;
			z-index: 1000;
			background: none;
			border: 1px solid rgba(222, 220, 209, 0.15);

			cursor: pointer;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
		`,

		// Button hover styles in CSS format (applied when hovering)
		buttonHoverStyles: `
			background-color: #262624 !important;
			outline: none !important;
			box-shadow: none !important;
		`,

		// Button disabled styles in CSS format (applied when button is disabled/inactive)
		buttonDisabledStyles: `
			display: none !important;
			outline: none !important;
		`,
	},
	't3.chat/chat/*': {
		// Optional: Custom button image size (default 24px)
		buttonImageSize: 16,

		// Optional: SVG colors for different states
		buttonSvgColor: '#E7CFDD', // Normal state SVG color
		buttonHoverSvgColor: '#E7CFDD', // Hover state SVG color

		// Input field selectors (you only need 1 but its good to have backups, top is used first)
		inputSelectors: [
			'#chat-input',
			'textarea[placeholder*="Type your message here..."]',
			'textarea[name="input"]',
		],

		// Button configuration
		buttonContainer: {
			// Fix the selector to properly target elements with negative class names
			selector:
				'div[class*="-mr-0.5"][class*="-mt-0.5"][class*="flex"][class*="items-center"][aria-label="Message actions"]',
			insertPosition: 'inside-start', // Position of the button relative to the selected container
		},

		// Button styles in CSS format
		buttonStyles: `
			/* Base button styles */
			position: relative;
			z-index: 1000;
			background: none;
			border: none;
			border-color: transparent !important;

			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 36px;
			height: 36px;
		`,

		// Button hover styles in CSS format (applied when hovering)
		buttonHoverStyles: `
			background-color: #342D39 !important;
			border: none !important;
			border-color: transparent !important;
			outline: none !important;
			box-shadow: none !important;
		`,

		// Button disabled styles in CSS format (applied when button is disabled/inactive)
		buttonDisabledStyles: `
			opacity: 0 !important;
			border: none !important;
			border-color: transparent !important;
			outline: none !important;
		`,
	},
};

// Helper function to convert friendly position names to DOM positions
function getInsertPosition(friendlyPosition) {
	const positionMap = {
		'inside-end': 'beforeend',
		'inside-start': 'afterbegin',
		'outside-before': 'beforebegin',
		'outside-after': 'afterend',
	};
	return positionMap[friendlyPosition] || friendlyPosition;
}

// Helper function to get config for current website
function getCurrentWebsiteConfig() {
	const hostname = window.location.hostname;
	const pathname = window.location.pathname;
	const fullUrl = hostname + pathname;

	console.log('Debug - Current URL:', fullUrl);
	console.log('Debug - Available configs:', Object.keys(WEBSITE_CONFIGS));

	// Find the matching config
	for (const [domain, config] of Object.entries(WEBSITE_CONFIGS)) {
		console.log('Debug - Checking domain:', domain);
		// Remove the * from the domain pattern and check if URL starts with it
		const domainPattern = domain.replace('/*', '');

		// Check if the pattern matches hostname only or includes path
		if (domainPattern.includes('/')) {
			// Pattern includes path - compare against full URL
			if (fullUrl.includes(domainPattern)) {
				console.log('Debug - Found matching config for:', domain);
				// Convert friendly position name to DOM position
				const originalConfig = { ...config };
				if (config.buttonContainer) {
					config.buttonContainer = {
						...config.buttonContainer,
						insertPosition: getInsertPosition(
							config.buttonContainer.insertPosition
						),
					};
				}
				return config;
			}
		} else {
			// Pattern is hostname only
			if (hostname.includes(domainPattern)) {
				console.log('Debug - Found matching config for:', domain);
				// Convert friendly position name to DOM position
				const originalConfig = { ...config };
				if (config.buttonContainer) {
					config.buttonContainer = {
						...config.buttonContainer,
						insertPosition: getInsertPosition(
							config.buttonContainer.insertPosition
						),
					};
				}
				return config;
			}
		}
	}

	console.log('Debug - No matching config found');
	return null;
}

// Make configs available globally
window.WEBSITE_CONFIGS = WEBSITE_CONFIGS;
window.getCurrentWebsiteConfig = getCurrentWebsiteConfig;
