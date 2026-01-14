// ==========================================
// THE PAINTER (Isolated World) - v2 (Debug)
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
      <span class="oculus-value" id="oculus-usage-text">WAITING...</span>
    </div>
  `;

  document.body.appendChild(container);
}

function updateUI(current, max) {
  const dot = document.getElementById('oculus-status-dot');
  const text = document.getElementById('oculus-usage-text');
  
  if (!dot || !text || max === 0) return;

  text.textContent = `${current} / ${max}`;
  const percentage = current / max;
  
  dot.className = 'oculus-dot'; 
  if (percentage >= 0.9) dot.classList.add('danger');
  else if (percentage >= 0.7) dot.classList.add('warn');
  else dot.classList.add('active');
}

// Listen for the Spy's signal
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  // HANDLE JSON DATA
  if (event.data.type === 'OCULUS_DATA') {
    const data = event.data.payload;

    // --- DEBUGGING: PRINT THE FULL DATA STRUCTURE ---
    // This will let us see the exact field names in the console
    if (JSON.stringify(data).includes('limit') || JSON.stringify(data).includes('stats')) {
      console.log("🔍 [OCULUS FOUND DATA]:", JSON.stringify(data, null, 2));
    }
    // ------------------------------------------------

    // Attempt to parse (Standard Patterns)
    if (data.stats && data.stats.limit) {
      updateUI(data.stats.count, data.stats.limit);
    } else if (data.messageLimit && data.messageLimit.limit) {
      updateUI(data.messageLimit.used, data.messageLimit.limit);
    }
  }

  // HANDLE HEADERS (New!)
  if (event.data.type === 'OCULUS_HEADERS') {
    console.log("🔍 [OCULUS FOUND HEADERS]:", event.data.payload);
    // If we find headers, we can interpret them here later
  }
});

// Initialize UI
createUI();