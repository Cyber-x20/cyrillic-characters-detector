const tabStatusMap = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateURLStatus(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    updateURLStatus(tab.id, tab.url);
  } catch (error) {
    console.error('Could not get tab info:', error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'pageContentStatus' && sender.tab) {
    updatePageStatus(sender.tab.id, message.pageHasCyrillic);
    sendResponse({ success: true });
  } else if (message.type === 'getCyrillicStatus' && message.tabId) {
    const status = tabStatusMap[message.tabId] || { urlHasCyrillic: false, pageHasCyrillic: false };
    sendResponse({
      urlHasCyrillic: status.urlHasCyrillic,
      pageHasCyrillic: status.pageHasCyrillic,
      combinedHasCyrillic: status.urlHasCyrillic || status.pageHasCyrillic
    });
    return true;
  }
});

function updateURLStatus(tabId, url) {
  if (!tabId || !url) return;
  if (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:')
  ) {
    setBadgeNormal(tabId);
    setTabStatus(tabId, false, tabStatusMap[tabId]?.pageHasCyrillic || false);
    return;
  }
  let hasCyrillic = false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    hasCyrillic = /[\u0400-\u04FF]/.test(hostname);
  } catch (e) {}
  setTabStatus(tabId, hasCyrillic, tabStatusMap[tabId]?.pageHasCyrillic || false);
  updateBadge(tabId);
}

function updatePageStatus(tabId, pageHasCyrillic) {
  if (!tabId) return;
  const urlHasCyrillic = tabStatusMap[tabId]?.urlHasCyrillic || false;
  setTabStatus(tabId, urlHasCyrillic, pageHasCyrillic);
  updateBadge(tabId);
}

function setTabStatus(tabId, urlHasCyrillic, pageHasCyrillic) {
  tabStatusMap[tabId] = { urlHasCyrillic, pageHasCyrillic };
}

function updateBadge(tabId) {
  const status = tabStatusMap[tabId];
  if (!status || (!status.urlHasCyrillic && !status.pageHasCyrillic)) {
    setBadgeNormal(tabId);
  } else {
    setBadgeWarning(tabId);
  }
}

function setBadgeWarning(tabId) {
  chrome.action.setBadgeText({ text: '⚠', tabId });
  chrome.action.setBadgeBackgroundColor({ color: '#FF4444', tabId });
  chrome.action.setTitle({ title: 'Cyrillic detected in URL or page content', tabId });
}

function setBadgeNormal(tabId) {
  chrome.action.setBadgeText({ text: '', tabId });
  chrome.action.setTitle({ title: 'Cyrillic URL Detector - No threats detected', tabId });
}
