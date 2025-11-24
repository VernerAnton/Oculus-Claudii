// ==========================================
// PART 1: THE INJECTOR
// This injects a script into the "Main World" to intercept fetch requests
// ==========================================

function injectSpy() {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      // Save the original fetch function
      const originalFetch = window.fetch;

      // Override fetch with our "Spy" wrapper
      window.fetch = async function(...args) {
        const response = await originalFetch(...args);
        
        // Clone the response so we can read it without breaking the app
        const clone = response.clone();
        
        // Check if this request is asking for organization stats
        // We look for URLs containing 'stats' or 'chat_conversations' which usually hold the limit data
        if (args[0] && (args[0].toString().includes('/stats') || args[0].toString().includes('/chat_conversations'))) {
          clone.json().then(data => {
            // Send the found data to the Content Script via postMessage
            window.postMessage({ type: 'OCULUS_DATA', payload: data }, '*');
          }).catch(err => {
            // Ignore json parse errors (some responses might not be json)
          });
        }

        return response;
      };
    })();
  `;
  document.documentElement.appendChild(script);
  script.remove(); // Clean up the tag, the code remains in memory
}

// ==========================================
// PART 2: THE PAINTER
// Handles the UI creation and updates
// ==========================================

function createUI() {
  if (document.getElementById('oculus-claudii-container')) return;

  const container = document.createElement('div');
  container.id = 'oculus-claudii-container';
  
  container.innerHTML = `
    <div class="oculus-pill" id="oculus-main-pill">
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="oculus-dot" id="oculus-status-dot"></div>
        <span class="oculus-label">USAGE</span>
      </div>
      <span class="oculus-value" id="oculus-usage-text">-- / --</span>
    </div>
  `;

  document.body.appendChild(container);
}

function updateUI(data) {
  const dot = document.getElementById('oculus-status-dot');
  const text = document.getElementById('oculus-usage-text');
  
  if (!dot || !text) return;

  // Note: The exact JSON path depends on the API response structure.
  // Based on typical Claude API patterns, we look for specific keys.
  // We will refine this after your first "Reconnaissance" test.
  
  let used = 0;
  let limit = 0;

  // Heuristic to find usage numbers in the payload
  if (data.stats) {
    // Common pattern
    used = data.stats.count || 0;
    limit = data.stats.limit || 0;
  } else if (data.messageLimit) {
    // Another potential pattern
    used = data.messageLimit.used;
    limit = data.messageLimit.limit;
  } else {
    // Fallback: Try to find any numbers that look like limits
    // For now, we will just console log the data so you can see it in DevTools
    console.log("[Oculus Claudii] Captured Data:", data);
    return; 
  }

  if (limit > 0) {
    text.textContent = `${used} / ${limit}`;
    
    // Color Logic
    const percentage = used / limit;
    dot.className = 'oculus-dot'; // Reset
    if (percentage >= 0.9) dot.classList.add('danger');
    else if (percentage >= 0.7) dot.classList.add('warn');
    else dot.classList.add('active');
  }
}

// ==========================================
// PART 3: THE LISTENER
// Connects the Spy to the Painter
// ==========================================

window.addEventListener('message', (event) => {
  // Only accept messages from our own window (security)
  if (event.source !== window) return;
  
  if (event.data.type === 'OCULUS_DATA') {
    console.log("[Oculus Claudii] Intercepted Payload:", event.data.payload);
    updateUI(event.data.payload);
  }
});

// Initialize
injectSpy();
createUI();