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

  // 1. SAFETY CHECK: If data is null/undefined, stop immediately to prevent crash
  if (!data) return;

  console.log("[Oculus Claudii] Analyzing Data:", data);

  let used = 0;
  let limit = 0;
  let found = false;

  // 2. PATTERN MATCHING: Try to find the numbers safely
  // Pattern A: Standard stats object
  if (data.stats && data.stats.count !== undefined) {
    used = data.stats.count;
    limit = data.stats.limit;
    found = true;
  } 
  // Pattern B: Message Limit object
  else if (data.messageLimit && data.messageLimit.used !== undefined) {
    used = data.messageLimit.used;
    limit = data.messageLimit.limit;
    found = true;
  }
  // Pattern C: Organization capabilities (sometimes buried here)
  else if (data.organization && data.organization.capabilities) {
    // Check for message_limit inside capabilities if it exists
    // This is a guess, we will verify with your next log
  }

  // 3. UPDATE UI ONLY IF DATA FOUND
  if (found && limit > 0) {
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