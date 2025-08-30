// Background Service Worker for Cyrillic URL Detector
class CyrillicDetectorBackground {
    constructor() {
        this.cyrillicRegex = /[\u0400-\u04FF]/g;
        this.setupListeners();
    }

    setupListeners() {
        // Listen for tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.url || changeInfo.status === 'complete') {
                this.checkTabURL(tab);
            }
        });

        // Listen for tab activation
        chrome.tabs.onActivated.addListener(async (activeInfo) => {
            try {
                const tab = await chrome.tabs.get(activeInfo.tabId);
                this.checkTabURL(tab);
            } catch (error) {
                console.log('Could not get tab info:', error);
            }
        });

        // Listen for extension icon clicks
        chrome.action.onClicked.addListener(async (tab) => {
            this.checkTabURL(tab);
        });
    }

    async checkTabURL(tab) {
        if (!tab || !tab.url) return;

        // Skip chrome:// and other internal URLs
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') ||
            tab.url.startsWith('edge://') ||
            tab.url.startsWith('about:')) {
            this.setBadgeNormal();
            return;
        }

        try {
            const url = new URL(tab.url);
            const hostname = url.hostname;

            if (this.hasCyrillicCharacters(hostname)) {
                this.setBadgeWarning();
                console.log('Cyrillic characters detected in URL:', hostname);
            } else {
                this.setBadgeNormal();
            }
        } catch (error) {
            console.log('Error parsing URL:', error);
            this.setBadgeNormal();
        }
    }

    hasCyrillicCharacters(text) {
        return this.cyrillicRegex.test(text);
    }

    setBadgeWarning() {
        chrome.action.setBadgeText({ text: '⚠' });
        chrome.action.setBadgeBackgroundColor({ color: '#FF4444' });
        chrome.action.setTitle({ title: 'Cyrillic characters detected - Click for details' });
    }

    setBadgeNormal() {
        chrome.action.setBadgeText({ text: '' });
        chrome.action.setTitle({ title: 'Cyrillic URL Detector - No threats detected' });
    }
}

// Initialize the background service worker
new CyrillicDetectorBackground();
