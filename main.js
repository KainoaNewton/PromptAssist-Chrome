// main.js - Sample usage of PageModifier helpers

// 1. Inject custom styles
PageModifier.injectCSS(`
  /* Highlight paragraphs with a yellow background */
  p { background: #fff9c4 !important; }
`);

// 2. Add a banner at the top of the page
PageModifier.onElementReady('body', body => {
  PageModifier.addElement('body', `
    <div id="pm-banner" style="background: #333; color: #fff; padding: 10px; text-align: center;">
      Welcome to your custom extension!
      <button id="pm-remove-banner" style="margin-left: 20px;">Dismiss</button>
    </div>
  `);

  // 3. Handle banner dismissal
  PageModifier.onClick('#pm-remove-banner', () => {
    PageModifier.removeElement('#pm-banner');
  });
});

// 4. Dynamically remove all images after 5 seconds
setTimeout(() => {
  PageModifier.removeElement('img');
  console.log('All images removed');
}, 5000); 