document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('status');
    const statusIconEl = document.getElementById('status-icon');
    const statusTextEl = document.getElementById('status-text');
    const currentUrlEl = document.getElementById('current-url');
    const cyrillicDetailsEl = document.getElementById('cyrillic-details');
    const cyrillicListEl = document.getElementById('cyrillic-list');
    const safeMessageEl = document.getElementById('safe-message');
    const refreshBtn = document.getElementById('refresh-btn');
  
    refreshBtn.addEventListener('click', () => displayStatus());
  
    function displayStatus() {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        currentUrlEl.textContent = tab.url || '';
        chrome.runtime.sendMessage({ type: 'getCyrillicStatus', tabId: tab.id }, (response) => {
          if (!response) {
            showError('Unable to get status');
            return;
          }
          showCombinedDetails(response);
        });
      });
    }
  
    function showCombinedDetails(status) {
      let warnings = [];
      let safe = true;
  
      if (status.urlHasCyrillic) {
        warnings.push('⚠️ Cyrillic characters detected in URL');
        safe = false;
      } else {
        warnings.push('✅ No Cyrillic characters detected in URL');
      }
  
      if (status.pageHasCyrillic) {
        warnings.push('⚠️ Cyrillic characters detected in page content');
        safe = false;
      } else {
        warnings.push('✅ No Cyrillic characters detected in page content');
      }
  
      if (safe) {
        statusEl.className = 'status safe';
        statusIconEl.textContent = '✅';
        statusTextEl.textContent = 'No Cyrillic characters detected';
        safeMessageEl.classList.remove('hidden');
      } else {
        statusEl.className = 'status danger';
        statusIconEl.textContent = '⚠️';
        statusTextEl.textContent = 'Cyrillic characters detected!';
        safeMessageEl.classList.add('hidden');
      }
  
      cyrillicDetailsEl.classList.remove('hidden');
      cyrillicListEl.innerHTML =
        '<ul style="margin:8px 0;line-height:1.6;">' +
        warnings.map((w) => `<li>${w}</li>`).join('') +
        '</ul>';
    }
  
    function showError(message) {
      statusEl.className = 'status warning';
      statusIconEl.textContent = '❌';
      statusTextEl.textContent = message;
      cyrillicDetailsEl.classList.add('hidden');
      safeMessageEl.classList.add('hidden');
    }
  
    displayStatus();
  });
  