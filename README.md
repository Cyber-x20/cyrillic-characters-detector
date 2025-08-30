# Cyrillic URL Detector Chrome Extension

A security-focused Chrome extension that detects Cyrillic characters in URLs to help prevent IDN homograph attacks.

## Features

- 🔍 **Real-time URL scanning** - Automatically detects Cyrillic characters in URLs
- ⚠️ **Visual warnings** - Shows badge and banner when threats are detected  
- 🛡️ **Security education** - Provides information about IDN homograph attacks
- 📊 **Detailed analysis** - Click extension icon for full URL analysis
- 🚀 **Lightweight** - Uses Manifest V3 for optimal performance

## Installation

### Method 1: Developer Mode (Recommended)

1. **Download the extension files** to a folder on your computer
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Method 2: Pack and Install

1. In `chrome://extensions/`, click **"Pack extension"**
2. Select the extension folder and create a `.crx` file
3. Drag the `.crx` file to the Chrome extensions page

## Usage

1. **Install the extension** using the method above
2. **Navigate to websites** normally
3. **Watch for warnings:**
   - Red badge (⚠) appears if Cyrillic characters detected
   - Warning banner shows on suspicious pages
4. **Click the extension icon** for detailed analysis
5. **Review security information** in the popup

## Security Information

### What are IDN Homograph Attacks?

IDN (Internationalized Domain Name) homograph attacks use look-alike characters from different alphabets to create fake domains that appear identical to legitimate sites.

**Examples:**
- `раypal.com` (uses Cyrillic 'р' instead of Latin 'p')
- `аpple.com` (uses Cyrillic 'а' instead of Latin 'a')  
- `gοοgle.com` (uses Greek 'ο' instead of Latin 'o')

### Protection Tips

1. ✅ **Always verify URLs** before entering sensitive information
2. ✅ **Check for HTTPS** and valid certificates
3. ✅ **Use bookmarks** for important sites
4. ✅ **Be suspicious** of unexpected redirects
5. ✅ **Enable this extension** for automatic detection

## Technical Details

- **Manifest Version:** V3 (latest Chrome extension standard)
- **Permissions:** `activeTab`, `tabs` (minimal permissions required)
- **Detection Method:** Unicode regex `[\u0400-\u04FF]` for Cyrillic range
- **Background Script:** Service worker for real-time monitoring
- **Content Script:** Provides visual warnings on web pages

## File Structure

```
cyrillic-url-detector/
├── manifest.json          # Extension configuration
├── background.js           # Service worker for URL monitoring  
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── content.js             # Content script for page warnings
├── icons/                 # Extension icons (16px, 48px, 128px)
└── README.md              # This file
```

## Privacy

This extension:
- ✅ **Only checks URLs** for Cyrillic characters
- ✅ **Works offline** - no data sent to external servers
- ✅ **Minimal permissions** - only accesses current tab when clicked
- ✅ **No tracking** - does not collect or store personal data

## Contributing

This is an open-source security tool. Contributions welcome:
- Report bugs or security issues
- Suggest improvements
- Submit pull requests
- Help with translations

## License

This extension is provided as-is for educational and security purposes.

---

**Stay safe online! 🛡️**
