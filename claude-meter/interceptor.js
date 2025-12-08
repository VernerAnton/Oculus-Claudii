// ==========================================
// THE SPY (Main World)
// ==========================================

(function() {
  // Save the original fetch function
  const originalFetch = window.fetch;

  // Override fetch with our wrapper
  window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    
    // Check if the URL contains usage stats
    if (args[0] && (args[0].toString().includes('/stats') || args[0].toString().includes('/chat_conversations') || args[0].toString().includes('organizations'))) {
      
      // Clone the response so we can read it
      const clone = response.clone();
      
      clone.json().then(data => {
        // Send the captured data to the Content Script (content.js)
        window.postMessage({ type: 'OCULUS_DATA', payload: data }, '*');
      }).catch(err => {
        // Ignore errors (not JSON)
      });
    }

    return response;
  };
})();