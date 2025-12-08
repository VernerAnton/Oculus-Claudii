// ==========================================
// THE PAINTER (Isolated World)
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

  // We are still hunting for the exact keys.
  // This log will reveal the truth once the Spy works.
  console.log("[Oculus Claudii] Captured Data:", data);

  // Placeholder logic until we confirm the JSON structure
  let used = 0;
  let limit = 0;

  // Attempt to auto-detect common patterns
  if (data.stats) {
    used = data.stats.count || 0;
    limit = data.stats.limit || 0;
  } else if (data.messageLimit) {
    used = data.messageLimit.used;
    limit = data.messageLimit.limit;
  }

  if (limit > 0) {
    text.textContent = `${used} / ${limit}`;
    const percentage = used / limit;
    
    dot.className = 'oculus-dot'; 
    if (percentage >= 0.9) dot.classList.add('danger');
    else if (percentage >= 0.7) dot.classList.add('warn');
    else dot.classList.add('active');
  }
}

// Listen for the Spy's signal
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'OCULUS_DATA') {
    updateUI(event.data.payload);
  }
});

// Initialize UI
createUI();