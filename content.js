// Enhanced Content script for Cyrillic URL Detector
// This script runs on all web pages to provide visual indicators for both URL and page content

(function() {
    'use strict';

    const CYRILLIC_REGEX = /[\u0400-\u04FF]/g;
    
    class CyrillicContentDetector {
        constructor() {
            this.init();
        }

        init() {
            // Only run on actual web pages, not extensions or internal pages
            if (window.location.protocol === 'chrome-extension:' || 
                window.location.protocol === 'chrome:' ||
                window.location.protocol === 'about:') {
                return;
            }

            this.checkCurrentURL();
            this.checkPageContent();
            this.setupURLChangeDetection();
        }

        checkCurrentURL() {
            const hostname = window.location.hostname;
            if (this.hasCyrillicCharacters(hostname)) {
                this.showWarningBanner('Warning: This URL contains Cyrillic characters that may indicate a phishing attempt');
                console.warn('Cyrillic URL Detector: Cyrillic characters detected in URL:', hostname);
            }
        }

        checkPageContent() {
            // Extract visible text content from the page
            const bodyText = document.body.innerText || '';
            if (this.hasCyrillicCharacters(bodyText)) {
                this.showWarningBanner('Warning: Cyrillic characters detected in page content which may be suspicious');
                console.warn('Cyrillic URL Detector: Cyrillic characters detected in page content');
            }
        }

        hasCyrillicCharacters(text) {
            return CYRILLIC_REGEX.test(text);
        }

        showWarningBanner(message) {
            // Remove existing banner if present
            const existing = document.getElementById('cyrillic-detector-banner');
            if (existing) {
                existing.remove();
            }

            // Create warning banner
            const banner = document.createElement('div');
            banner.id = 'cyrillic-detector-banner';
            banner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #d32f2f, #f44336);
                color: white;
                padding: 8px 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                font-weight: 500;
                text-align: center;
                z-index: 999999;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                border-bottom: 2px solid #b71c1c;
            `;

            banner.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span style="font-size: 16px;">⚠️</span>
                    <span>${message}</span>
                    <button id="cyrillic-banner-close" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 4px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        margin-left: 12px;
                    ">✕</button>
                </div>
            `;

            // Add to page
            document.body.insertBefore(banner, document.body.firstChild);

            // Add close functionality
            const closeBtn = document.getElementById('cyrillic-banner-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    banner.remove();
                    document.body.style.paddingTop = '';
                });

                // Auto-hide after 10 seconds
                setTimeout(() => {
                    if (banner.parentNode) {
                        banner.style.transition = 'opacity 0.5s ease-out';
                        banner.style.opacity = '0';
                        setTimeout(() => banner.remove(), 500);
                        document.body.style.paddingTop = '';
                    }
                }, 10000);
            }

            // Adjust page content to account for banner
            document.body.style.paddingTop = '40px';
        }

        setupURLChangeDetection() {
            // Listen for URL changes (for SPAs)
            let currentURL = window.location.href;
            
            const observer = new MutationObserver(() => {
                if (window.location.href !== currentURL) {
                    currentURL = window.location.href;
                    setTimeout(() => {
                        this.checkCurrentURL();
                        this.checkPageContent();
                    }, 100);
                }
            });

            observer.observe(document.body, { 
                childList: true, 
                subtree: true 
            });

            window.addEventListener('popstate', () => {
                setTimeout(() => {
                    this.checkCurrentURL();
                    this.checkPageContent();
                }, 100);
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new CyrillicContentDetector();
        });
    } else {
        new CyrillicContentDetector();
    }
})();
