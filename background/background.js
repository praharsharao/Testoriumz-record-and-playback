/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

var master = {};
var clickEnabled = true;
const popupWindowIDs = [];

function focusPanel() {
  popupWindowIDs.forEach((id) => {
    browser.windows.update(id, { focused: true });
  });
}

// open main window
function openPanel(tab, noFocus = false) {
  let contentWindowId = tab.windowId;
  if (master[contentWindowId] != undefined) {
    browser.windows
      .update(master[contentWindowId], {
        focused: !noFocus,
      })
      .catch(function (e) {
        master[contentWindowId] == undefined;
        openPanel(tab);
      });
    return;
  } else if (!clickEnabled) {
    return;
  }

  clickEnabled = false;
  setTimeout(function () {
    clickEnabled = true;
  }, 1000);

  // open GUI with specified size
  var f = function (height, width) {
    const url = "panel/index.html";
    browser.windows
      .create({
        url: browser.runtime.getURL(url),
        type: "popup",
        height: height,
        width: width,
        focused: !noFocus,
      })
      .then(function waitForPanelLoaded(panelWindowInfo) {
        return new Promise(function (resolve, reject) {
          let count = 0;
          let interval = setInterval(function () {
            if (count > 100) {
              reject("SideeX editor has no response");
              clearInterval(interval);
            }

            browser.tabs
              .query({
                active: true,
                windowId: panelWindowInfo.id,
                status: "complete",
              })
              .then(function (tabs) {
                if (tabs.length != 1) {
                  count++;
                  return;
                } else {
                  master[contentWindowId] = panelWindowInfo.id;
                  if (Object.keys(master).length === 1) {
                    createKrMenus();
                  }
                  resolve(panelWindowInfo);
                  clearInterval(interval);
                }
              });
          }, 500);
        });
      })
      .then(function bridge(panelWindowInfo) {
        popupWindowIDs.push(panelWindowInfo.id);
        return browser.tabs.sendMessage(panelWindowInfo.tabs[0].id, {
          selfWindowId: panelWindowInfo.id,
          commWindowId: contentWindowId,
        });
      })
      .catch(function (e) {
        console.log(e);
      });
  };

  // get previous window size, and open the window
  getWindowSize(f, false);
}

browser.action.onClicked.addListener(openPanel);

browser.windows.onRemoved.addListener(function (windowId) {
  let keys = Object.keys(master);
  for (let key of keys) {
    if (master[key] === windowId) {
      delete master[key];
      if (keys.length === 1) {
        browser.contextMenus.removeAll();
      }
    }
  }
});

// context menu
function createKrMenus() {
  browser.contextMenus.create({
    id: "verifyText",
    title: "verifyText",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "verifyTitle",
    title: "verifyTitle",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "verifyValue",
    title: "verifyValue",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "assertText",
    title: "assertText",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "assertTitle",
    title: "assertTitle",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "assertValue",
    title: "assertValue",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "storeText",
    title: "storeText",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "storeTitle",
    title: "storeTitle",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "storeValue",
    title: "storeValue",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "waitForElementPresent",
    title: "waitForElementPresent",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "waitForElementNotPresent",
    title: "waitForElementNotPresent",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "waitForTextPresent",
    title: "waitForTextPresent",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "waitForTextNotPresent",
    title: "waitForTextNotPresent",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "waitForValue",
    title: "waitForValue",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "waitForNotValue",
    title: "waitForNotValue",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "waitForVisible",
    title: "waitForVisible",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "waitForNotVisible",
    title: "waitForNotVisible",
    documentUrlPatterns: ["<all_urls>"],
    contexts: ["all"],
  });
}

var port;
browser.contextMenus.onClicked.addListener(function (info, tab) {
  port.postMessage({ cmd: info.menuItemId });
});

browser.runtime.onConnect.addListener(function (m) {
  port = m;
});

const keepAlive = () => setInterval(browser.runtime.getPlatformInfo, 20e3);
browser.runtime.onStartup.addListener(keepAlive);
keepAlive();

// Authentication monitoring
let authCheckInterval;

// Start authentication monitoring
function startAuthMonitoring() {
  if (authCheckInterval) {
    clearInterval(authCheckInterval);
  }
  
  // Check authentication every 10 minutes
  authCheckInterval = setInterval(async () => {
    try {
      const { AuthService } = await import('./panel/js/UI/services/auth-service/auth-service.js');
      const authStatus = await AuthService.checkAuthenticationStatus();
      
      if (!authStatus.isAuthenticated) {
        console.log("Background: Authentication lost, notifying extension");
        // Notify the extension that authentication was lost
        browser.runtime.sendMessage({ type: "auth-lost" });
      }
    } catch (error) {
      console.log("Background auth check error:", error);
    }
  }, 600000); // 10 minutes
}

// Handle messages from content scripts
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "check-auth") {
    try {
      const { AuthService } = await import('./panel/js/UI/services/auth-service/auth-service.js');
      const authStatus = await AuthService.checkAuthenticationStatus();
      sendResponse(authStatus);
    } catch (error) {
      console.log("Auth check error:", error);
      sendResponse({ isAuthenticated: false, user: null });
    }
    return true; // Keep the message channel open for async response
  }
  
  if (message.type === "auth-lost") {
    // Handle authentication loss
    console.log("Authentication lost, clearing stored data");
    await browser.storage.local.remove("accessToken");
    await browser.storage.local.remove("refreshToken");
    await browser.storage.local.remove("checkLoginData");
    await browser.storage.local.remove("userInfo");
  }

  // Handle portal authentication updates
  if (message.type === "portal-auth-update" || message.type === "portal-login-success") {
    console.log("Received portal auth update:", message.type);
    
    if (message.authData && message.authData.token) {
      try {
        const { AuthService } = await import('./panel/js/UI/services/auth-service/auth-service.js');
        
        // Store the token
        await AuthService.storeToken({
          access_token: message.authData.token,
          refresh_token: message.authData.token,
          expires_in: 3600
        });
        
        // Store user info if available
        if (message.authData.userInfo) {
          await browser.storage.local.set({ userInfo: message.authData.userInfo });
        }
        
        // Notify the extension about successful authentication
        browser.runtime.sendMessage({ 
          type: "portal-auth-success", 
          user: message.authData.userInfo 
        });
        
        console.log("Portal authentication stored successfully");
      } catch (error) {
        console.log("Error storing portal auth:", error);
      }
    }
  }
});

// Start monitoring when extension loads
startAuthMonitoring();
