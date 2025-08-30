(function() {
    'use strict';
  
    const CYRILLIC_REGEX = /[\u0400-\u04FF]/;
    class CyrillicContentDetector {
      constructor() { this.init(); }
      init() {
        if (window.location.protocol.startsWith('chrome') || window.location.protocol === 'about:') {
          this.notifyBackground(false);
          return;
        }
        this.checkAll();
        this.setupURLChangeDetection();
      }
  
      checkAll() {
        const hostname = window.location.hostname;
        const urlHasCyrillic = this.hasCyrillicCharacters(hostname);
        const bodyText = document.body.innerText || '';
        const pageHasCyrillic = this.hasCyrillicCharacters(bodyText);
  
        if (urlHasCyrillic) {
          this.showWarning(
            'Warning: This URL contains Cyrillic characters that may indicate a phishing attempt'
          );
        } else if (pageHasCyrillic) {
          this.showWarning(
            'Warning: Cyrillic characters detected in page content which may be suspicious'
          );
        } else {
          this.removeWarning();
        }
        this.notifyBackground(pageHasCyrillic);
      }
  
      hasCyrillicCharacters(text) {
        return CYRILLIC_REGEX.test(text);
      }
  
      showWarning(message) {
        const existing = document.getElementById('cyrillic-detector-banner');
        if (existing) existing.remove();
        const banner = document.createElement('div');
        banner.id = 'cyrillic-detector-banner';
        banner.style.cssText = `
                  position: fixed; top:0; left:0; right:0;
                  background: linear-gradient(135deg, #d32f2f, #f44336);
                  color: white; padding: 8px 16px;
                  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;
                  font-size: 14px; font-weight:500; text-align:center; z-index:999999;
                  box-shadow:0 2px 10px rgba(0,0,0,0.3); border-bottom:2px solid #b71c1c;
              `;
        banner.innerHTML = `
                  <div style="display:flex;align-items:center;justify-content:center;gap:8px;">
                      <span style="font-size:16px;">⚠️</span>
                      <span>${message}</span>
                      <button id="cyrillic-banner-close" style="
                          background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3);
                          color:white; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px; margin-left:12px;
                      ">✕</button>
                  </div>
              `;
        document.body.insertBefore(banner, document.body.firstChild);
        const closeBtn = document.getElementById('cyrillic-banner-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            banner.remove();
            document.body.style.paddingTop = '';
          });
          setTimeout(() => {
            if (banner.parentNode) {
              banner.style.transition = 'opacity 0.5s ease-out';
              banner.style.opacity = '0';
              setTimeout(() => banner.remove(), 500);
              document.body.style.paddingTop = '';
            }
          }, 10000);
        }
        document.body.style.paddingTop = '40px';
      }
  
      removeWarning() {
        const existing = document.getElementById('cyrillic-detector-banner');
        if (existing) {
          existing.remove();
          document.body.style.paddingTop = '';
        }
      }
  
      notifyBackground(hasCyrillic) {
        chrome.runtime.sendMessage({ type: 'pageContentStatus', pageHasCyrillic: hasCyrillic });
      }
  
      setupURLChangeDetection() {
        let currentURL = window.location.href;
        const observer = new MutationObserver(() => {
          if (window.location.href !== currentURL) {
            currentURL = window.location.href;
            setTimeout(() => this.checkAll(), 100);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('popstate', () => setTimeout(() => this.checkAll(), 100));
      }
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new CyrillicContentDetector());
    } else {
      new CyrillicContentDetector();
    }
  })();
  