// Popup script for Cyrillic URL Detector Chrome Extension
class CyrillicDetectorPopup {
    constructor() {
        this.cyrillicRegex = /[\u0400-\u04FF]/g;
        this.commonLookAlikes = {
            'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
            'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O',
            'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X', 'І': 'I'
        };
        this.init();
    }

    async init() {
        this.setupElements();
        this.setupEventListeners();
        await this.analyzeCurrentTab();
    }

    setupElements() {
        this.elements = {
            loading: document.getElementById('loading'),
            results: document.getElementById('results'),
            status: document.getElementById('status'),
            statusIcon: document.getElementById('status-icon'),
            statusText: document.getElementById('status-text'),
            currentUrl: document.getElementById('current-url'),
            cyrillicDetails: document.getElementById('cyrillic-details'),
            cyrillicList: document.getElementById('cyrillic-list'),
            safeMessage: document.getElementById('safe-message'),
            refreshBtn: document.getElementById('refresh-btn')
        };
    }

    setupEventListeners() {
        this.elements.refreshBtn.addEventListener('click', () => {
            this.analyzeCurrentTab();
        });
    }

    async analyzeCurrentTab() {
        this.showLoading();

        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !tab.url) {
                this.showError('Cannot access current tab URL');
                return;
            }

            // Skip internal pages
            if (this.isInternalPage(tab.url)) {
                this.showInternalPage(tab.url);
                return;
            }

            const analysis = this.analyzeURL(tab.url);
            this.displayResults(analysis);

        } catch (error) {
            console.error('Error analyzing tab:', error);
            this.showError('Error accessing current tab');
        }
    }

    isInternalPage(url) {
        return url.startsWith('chrome://') || 
               url.startsWith('chrome-extension://') ||
               url.startsWith('edge://') ||
               url.startsWith('about:') ||
               url.startsWith('moz-extension://');
    }

    analyzeURL(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;

            // Find Cyrillic characters
            const cyrillicMatches = hostname.match(this.cyrillicRegex);
            const hasCyrillic = cyrillicMatches && cyrillicMatches.length > 0;

            let cyrillicChars = [];
            if (hasCyrillic) {
                const uniqueChars = [...new Set(cyrillicMatches)];
                cyrillicChars = uniqueChars.map(char => ({
                    char: char,
                    unicode: 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'),
                    lookAlike: this.commonLookAlikes[char] || null
                }));
            }

            return {
                url: url,
                hostname: hostname,
                hasCyrillic: hasCyrillic,
                cyrillicChars: cyrillicChars,
                isValid: true
            };
        } catch (error) {
            return {
                url: url,
                error: 'Invalid URL format',
                isValid: false
            };
        }
    }

    displayResults(analysis) {
        this.hideLoading();
        this.showResults();

        // Display current URL
        this.elements.currentUrl.textContent = analysis.hostname || analysis.url;

        if (!analysis.isValid) {
            this.showError(analysis.error);
            return;
        }

        if (analysis.hasCyrillic) {
            this.showCyrillicDetected(analysis);
        } else {
            this.showSafeURL();
        }
    }

    showCyrillicDetected(analysis) {
        // Set status
        this.elements.status.className = 'status danger';
        this.elements.statusIcon.textContent = '⚠️';
        this.elements.statusText.textContent = 'Cyrillic characters detected!';

        // Show Cyrillic details
        this.elements.cyrillicDetails.classList.remove('hidden');
        this.elements.safeMessage.classList.add('hidden');

        // Build Cyrillic character list
        this.elements.cyrillicList.innerHTML = '';
        analysis.cyrillicChars.forEach(charInfo => {
            const item = document.createElement('div');
            item.className = 'cyrillic-item';

            const charSpan = document.createElement('span');
            charSpan.className = 'cyrillic-char';
            charSpan.textContent = charInfo.char;

            const infoSpan = document.createElement('span');
            infoSpan.innerHTML = `${charInfo.unicode}${charInfo.lookAlike ? ` <span class="lookalike">→ "${charInfo.lookAlike}"</span>` : ''}`;

            item.appendChild(charSpan);
            item.appendChild(infoSpan);
            this.elements.cyrillicList.appendChild(item);
        });
    }

    showSafeURL() {
        // Set status
        this.elements.status.className = 'status safe';
        this.elements.statusIcon.textContent = '✅';
        this.elements.statusText.textContent = 'URL appears safe';

        // Show safe message, hide Cyrillic details
        this.elements.safeMessage.classList.remove('hidden');
        this.elements.cyrillicDetails.classList.add('hidden');
    }

    showInternalPage(url) {
        this.hideLoading();
        this.showResults();

        this.elements.currentUrl.textContent = url;
        this.elements.status.className = 'status';
        this.elements.statusIcon.textContent = 'ℹ️';
        this.elements.statusText.textContent = 'Internal browser page';

        this.elements.safeMessage.classList.add('hidden');
        this.elements.cyrillicDetails.classList.add('hidden');
    }

    showError(message) {
        this.hideLoading();
        this.showResults();

        this.elements.status.className = 'status warning';
        this.elements.statusIcon.textContent = '❌';
        this.elements.statusText.textContent = message;

        this.elements.safeMessage.classList.add('hidden');
        this.elements.cyrillicDetails.classList.add('hidden');
    }

    showLoading() {
        this.elements.loading.classList.remove('hidden');
        this.elements.results.classList.add('hidden');
    }

    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }

    showResults() {
        this.elements.results.classList.remove('hidden');
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CyrillicDetectorPopup();
});
