// background.js - Handle extension-level functionality

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'showPopup') {
		// This will make the browser show the popup UI
		chrome.action.openPopup();
	}
});
