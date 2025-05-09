// Configuration for supported websites
const WEBSITE_CONFIGS = {
	// This is an example, but it does actually work
	'demo.chat-sdk.dev/*': {
		// Optional: Custom button image
		buttonImage: '',

		// Input field selectors (you only need 1 but its good to have backups, top is used first)
		inputSelectors: [
			'#multimodal-input',
			'textarea[placeholder*="Send a message..."]',
			'textarea[rows="2"]',
		],

		// Button configuration
		buttonContainer: {
			selector: '.absolute.bottom-0.p-2.w-fit.flex.flex-row.justify-start', // Selector for the container of the button
			insertPosition: 'inside-start', // Position of the button relative to the selected container
		},

		// Button styles in CSS format
		buttonStyles: `
			background: none;
			border: none;
			padding: 7px;
			cursor: pointer;
			border-radius: 6px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			transition: background-color 0.2s;
			width: 30px;
			height: 30px;
			margin-right: 8px;
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

	console.log('Debug - No matching config found');
	return null;
}

// Make configs available globally
window.WEBSITE_CONFIGS = WEBSITE_CONFIGS;
window.getCurrentWebsiteConfig = getCurrentWebsiteConfig;
