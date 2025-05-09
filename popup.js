document.addEventListener('DOMContentLoaded', () => {
	const apiKeyInput = document.getElementById('api-key');
	const saveButton = document.getElementById('save-button');
	const editButton = document.getElementById('edit-button');
	const statusElement = document.getElementById('status');

	let isEditMode = true;

	// Load saved API key if it exists
	chrome.storage.local.get(['geminiApiKey'], (result) => {
		if (result.geminiApiKey) {
			apiKeyInput.value = result.geminiApiKey;
			// If we have a key, start in view mode
			setViewMode();
		}
	});

	function setViewMode() {
		isEditMode = false;
		apiKeyInput.type = 'password';
		apiKeyInput.readOnly = true;
		saveButton.style.display = 'none';
		editButton.style.display = 'block';
		editButton.textContent = 'Edit';
	}

	function setEditMode() {
		isEditMode = true;
		apiKeyInput.type = 'text';
		apiKeyInput.readOnly = false;
		saveButton.style.display = 'block';
		editButton.style.display = 'none';
		apiKeyInput.focus();
		apiKeyInput.setSelectionRange(0, apiKeyInput.value.length);
	}

	// Save API key when button is clicked
	saveButton.addEventListener('click', () => {
		const apiKey = apiKeyInput.value.trim();

		if (!apiKey) {
			showStatus('Please enter a valid API key', 'error');
			return;
		}

		chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
			showStatus('API key saved successfully!', 'success');
			setViewMode();
		});
	});

	// Handle edit button click
	editButton.addEventListener('click', setEditMode);

	function showStatus(message, type) {
		statusElement.textContent = message;
		statusElement.className = 'status ' + type;

		// Clear status after 3 seconds
		setTimeout(() => {
			statusElement.textContent = '';
			statusElement.className = 'status';
		}, 3000);
	}

	// Handle Enter key in input field
	apiKeyInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter' && isEditMode) {
			saveButton.click();
		}
	});
});
