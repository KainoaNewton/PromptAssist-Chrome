# Prompt Assist Chrome Extension

A Chrome extension that adds an "Improve" button to AI chat applications, enhancing your prompts with Gemini AI.

## Features

- Automatically detects input fields in popular AI chat applications (ChatGPT, Claude, Gemini, Perplexity, etc.)
- Adds an "Improve" button next to the input field
- When clicked, analyzes your prompt and enhances it using the Gemini API
- Supports various AI chat interfaces with different input types

## Setup

1. Install the extension from Chrome Web Store or load it as an unpacked extension
2. Click on the extension icon in your toolbar
3. Enter your Gemini API key in the settings popup
4. Visit any supported AI chat website and start using improved prompts!

## Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Log in with your Google account
3. Create an API key
4. Copy the key and paste it into the extension settings

## Supported Websites

- OpenAI ChatGPT (chat.openai.com)
- Anthropic Claude (claude.ai)
- Google Gemini (gemini.google.com)
- Perplexity AI (perplexity.ai)
- And other AI chat applications with similar interface

## Adding Support for New Websites

You can add support for new websites by adding a configuration to `website-configs.js`. Here's a detailed guide on how to do it:

### Basic Configuration Structure

```javascript
'your-website.com/*': {
    // REQUIRED: Input field selectors - at least one is needed
    inputSelectors: [
        '#main-input',                // Primary selector
        'textarea.chat-input',        // Fallback selector
        'div[contenteditable="true"]' // Another fallback
    ],

    // REQUIRED: Button container configuration
    buttonContainer: {
        selector: '.chat-controls',   // Where to find the container for the button
        insertPosition: 'inside-start', // Position relative to container
    },

    // OPTIONAL: Button appearance customization
    buttonImage: 'path/to/icon.png',  // Custom button image (default: sparkle SVG)
    buttonImageSize: 24,              // Size of button image in pixels (default: 24)
    buttonImageAspectRatio: 0.75,     // Aspect ratio for height (default: 1)

    // OPTIONAL: SVG color customization
    buttonSvgColor: '#FFFFFF',        // Normal state SVG color (default: white)
    buttonHoverSvgColor: '#FFFFFF',   // Hover state SVG color
    buttonDisabledSvgColor: '#888888', // Disabled state SVG color

    // OPTIONAL: Button style customization
    buttonStyles: `
        background: none;
        border: none;
        padding: 7px;
        cursor: pointer;
        border-radius: 6px;
    `,

    buttonHoverStyles: `
        background-color: rgba(0, 0, 0, 0.05);
    `,

    buttonDisabledStyles: `
        opacity: 0.5;
        cursor: not-allowed;
        background-color: rgba(74, 74, 74, 0.2);
    `,
}
```

### Step-by-Step Guide

1. **Domain Pattern**

   ```javascript
   'your-website.com/*': {
       // config here
   }
   ```

   - Use `*` for wildcard matching
   - Examples:
     - `'chat.openai.com/*'` - Matches all paths on chat.openai.com
     - `'*.your-website.com/*'` - Matches all subdomains
     - `'your-website.com/chat/*'` - Matches specific path

2. **Button Version**

   ```javascript
   buttonVersion: 'custom-icon',  // 'text', 'custom-icon', or 'logo'
   ```

   - `text`: Simple text button with optional icon
   - `custom-icon`: Modern design with icon and text
   - `logo`: Icon-only button (uses extension's icon.png by default)

3. **Custom Button Settings**

   All of these properties are optional with reasonable defaults:

   ```javascript
   // Image customization (all optional)
   buttonImage: 'images/custom-icon.png',  // Default: built-in sparkle SVG icon
   buttonImageSize: 24,                    // Default: 24 pixels
   buttonImageAspectRatio: 0.75,           // Default: 1.0 (square)

   // SVG color customization (all optional)
   buttonSvgColor: '#FFFFFF',              // Default: white
   buttonHoverSvgColor: '#F0F0F0',         // Color when hovering
   buttonDisabledSvgColor: '#888888',      // Color when disabled

   // Style customization (all optional)
   buttonStyles: `
       background: none;
       border: none;
       padding: 7px;
       cursor: pointer;
       border-radius: 6px;
   `,  // Default: transparent background with standard padding

   buttonHoverStyles: `
       background-color: rgba(0, 0, 0, 0.05);
   `,  // Default: slight background darkening on hover

   buttonDisabledStyles: `
       opacity: 0.5;
       cursor: not-allowed;
       background-color: rgba(74, 74, 74, 0.2);
   `,  // Default: semi-transparent gray when button is disabled
   ```

   You only need to specify properties you want to customize. The default
   button works well in most cases without any customization.

4. **Input Field Selectors**

   ```javascript
   inputSelectors: [
   	// List in order of preference - first match will be used
   	'#specific-input-id', // Most specific
   	'textarea.chat-input', // Class-based
   	'div[contenteditable="true"]', // Attribute-based
   	'textarea[rows="2"]', // Generic fallback
   ];
   ```

   Tips for finding selectors:

   - Use browser DevTools to inspect the input element
   - Start with specific IDs or unique classes
   - Include fallbacks for different states/variations
   - Test with multiple chat sessions/states

5. **Button Container**

   ```javascript
   buttonContainer: {
       // Where to insert the button
       selector: '.chat-controls',  // Container element selector

       // Position relative to container
       insertPosition: 'inside-start',  // Where to place the button

       // Optional styling
       styles: {
           marginLeft: '8px',
           display: 'inline-block',
           verticalAlign: 'middle'
       }
   }
   ```

   Position options:

   - `inside-start`: Beginning of container
   - `inside-end`: End of container
   - `outside-before`: Before container
   - `outside-after`: After container

6. **Custom CSS**

   ```javascript
   customCSS: `
       /* Text Button Customization */
       .prompt-assist-button.version-text {
           background-color: #4285f4;
           color: white;
       }
   
       /* Shadcn Button Customization */
       .prompt-assist-button.version-shadcn {
           background-color: hsl(222.2 47.4% 11.2%);
           color: hsl(210 40% 98%);
       }
   
       /* Logo Button Customization */
       .prompt-assist-button.version-logo {
           width: 24px;
           height: 24px;
       }
   
       /* Tooltip Customization */
       .prompt-assist-button::before {
           background-color: #2d2d2d;
           color: white;
       }
   `;
   ```

### Example Configurations

1. **Minimal Configuration (Only Required Properties)**

```javascript
'simple-chat.com/*': {
    // Only specify what's needed - everything else uses defaults
    inputSelectors: ['#chat-input'],
    buttonContainer: {
        selector: '.input-wrapper',
        insertPosition: 'inside-end'
    }
}
```

2. **Simple Text Button**

```javascript
'simple-chat.com/*': {
    buttonVersion: 'text',
    buttonText: 'Improve',
    inputSelectors: ['#chat-input'],
    buttonContainer: {
        selector: '.input-wrapper',
        insertPosition: 'inside-end',
        styles: {
            marginLeft: '8px'
        }
    }
}
```

3. **Custom Styled Custom-Icon Button**

```javascript
'fancy-chat.com/*': {
    buttonVersion: 'custom-icon',
    buttonImage: 'magic-wand.svg',
    buttonImageSize: 24,               // Base size - controls the width
    buttonImageAspectRatio: 0.75,      // Makes height 18px (24 × 0.75 = 18)

    // Custom SVG colors for different states
    buttonSvgColor: '#BBBBBB',         // Light gray in normal state
    buttonHoverSvgColor: '#FFFFFF',    // White when hovering
    buttonDisabledSvgColor: '#666666', // Dark gray when disabled

    buttonText: 'Enhance',
    buttonTooltip: 'Enhance your prompt with AI',
    inputSelectors: [
        '.chat-textarea',
        'div[contenteditable="true"]'
    ],
    buttonContainer: {
        selector: '.toolbar-container',
        insertPosition: 'inside-start',
        styles: {
            marginRight: '8px'
        }
    },
    buttonStyles: `
        background-color: #2a2a2a;
        border: 1px solid #3a3a3a;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
    `,
    buttonHoverStyles: `
        background-color: #3a3a3a;
        border-color: #4a4a4a;
    `,
    buttonDisabledStyles: `
        opacity: 0.4;
        cursor: not-allowed;
        background-color: #1a1a1a;
        border-color: #2a2a2a;
    `,
    customCSS: `
        .prompt-assist-button.version-shadcn {
            background-color: #2a2a2a;
            border-color: #3a3a3a;
        }
    `
}
```

4. **Minimal Logo Button**

```javascript
'minimal-chat.com/*': {
    buttonVersion: 'logo',
    buttonImage: 'improve-icon.png',
    inputSelectors: ['#message-input'],
    buttonContainer: {
        selector: '.actions-bar',
        insertPosition: 'inside-end'
    },
    customCSS: `
        .prompt-assist-button.version-logo {
            padding: 6px;
            border-radius: 50%;
        }
    `
}
```

### Testing Your Configuration

1. Add your configuration to `website-configs.js`
2. Go to `chrome://extensions/`
3. Enable Developer Mode
4. Click "Reload" on the Prompt Assist extension
5. Visit your website and verify:
   - Button appears in the correct location
   - Styling matches your design
   - Click functionality works
   - Tooltip appears correctly

### Debugging Tips

- Check the browser console for debug messages
- Verify your selectors using DevTools
- Test with different page states (empty chat, multiple messages)
- Consider responsive design and different screen sizes

## How It Works

The extension analyzes your prompt using the Persona-Task-Context-Format framework and enhances it for better results from AI systems.

## Privacy

Your prompts are sent to Google's Gemini API for enhancement. The extension does not store your prompts, and your API key is stored only in your browser's local storage.
