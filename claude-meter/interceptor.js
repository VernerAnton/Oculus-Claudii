// ==========================================
// THE SPY (Main World) - v2 (Robust)
// ==========================================

(function() {
  // Prevent double-injection
  if (window.__OCULUS_INTERCEPTOR_ACTIVE) return;
  window.__OCULUS_INTERCEPTOR_ACTIVE = true;

  const originalFetch = window.fetch;

  window.fetch = async function(...args) {
    let response;
    
    // 1. SAFETY WRAPPER: Prevent crashes if requests are blocked (e.g. by ad-blockers)
    try {
      response = await originalFetch(...args);
    } catch (err) {
      // If the original fetch fails (network error), we must re-throw it 
      // so the main app knows it failed. We just silently step aside.
      throw err;
    }

    // 2. ANALYZE REQUESTS
    // We look for specific usage endpoints
    const url = args[0] ? args[0].toString() : '';
    
    // Filter for relevant API calls
    if (url.includes('/stats') || url.includes('/chat_conversations') || url.includes('organizations')) {
      
      // A. HEADER CHECK (New!)
      // sometimes limits are sent in headers like "x-rate-limit-remaining"
      const headers = {};
      response.headers.forEach((value, key) => {
        if (key.includes('limit') || key.includes('remaining')) {
          headers[key] = value;
        }
      });

      if (Object.keys(headers).length > 0) {
        window.postMessage({ type: 'OCULUS_HEADERS', payload: headers }, '*');
      }

      // B. BODY CHECK
      try {
        const clone = response.clone();
        clone.json().then(data => {
          window.postMessage({ type: 'OCULUS_DATA', payload: data }, '*');
        }).catch(() => {
          // Ignore JSON parse errors (it might be a stream or empty)
        });
      } catch (e) {
        // Ignore cloning errors
      }
    }

    return response;
  };
})();