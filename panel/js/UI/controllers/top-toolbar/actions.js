import { findTestSuiteById } from "../../services/data-service/test-suite-service.js";
import { getSelectedSuite } from "../../view/testcase-grid/selected-suite.js";
import { getCheckLoginData } from "../../../../../content-marketing/panel/login-inapp.js";
import {
  setSegmentUser,
  trackingLogin,
} from "../../services/tracking-service/segment-tracking-service.js";
import {
  setHubspotUser,
  trackingHubspotLogin,
} from "../../services/tracking-service/hubspot-tracking-service.js";
import AuthService, {
  REDIRECT_URI,
} from "../../services/auth-service/auth-service.js";

async function logout() {
  let result = await browser.storage.local.get("segment");
  let checkedResult = await browser.storage.local.get("checkLoginData");
  if (result.segment.user && checkedResult.checkLoginData.isActived) {
    await setSegmentUser("");
    await setHubspotUser("");

    checkedResult.checkLoginData.user = "";
    checkedResult.checkLoginData.isActived = false;
    checkedResult.checkLoginData.hasLoggedIn = false;
    browser.storage.local.set(checkedResult);

    $("#login-user").hide();
    $("#login-button").show();

    // logout from keycloak
    AuthService.logout()
      .then(() => {
        // logout from TestOps
        return fetch(testOpsUrls.logoutFromTestOps, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      })
      .then(() => {
        updateTestOpsLoginToken();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        browser.storage.local.remove("refreshToken");
      });
  }
}

async function setUserAfterLogin(accessToken) {
  const newValue = jwtJsDecode.decode(accessToken);
  const { email } = newValue.payload;
  const result = await getCheckLoginData();
  let checkLoginData = result.checkLoginData;
  checkLoginData.isActived = true;
  checkLoginData.hasLoggedIn = true;
  checkLoginData.user = email;
  await browser.storage.local.set(result);

  await setSegmentUser(email);
  await trackingLogin();
  await setHubspotUser(email);
  await trackingHubspotLogin();
}

$(() => {
  let setLoginTokenTimeout;

  $("#play").click(function (e) {
    const selectedTestSuite = getSelectedSuite();
    const testSuite = findTestSuiteById(selectedTestSuite.id);
    if (testSuite.status && testSuite.status === "dynamic") {
      $("#playSuite").click();
    } else {
      $("#playback").click();
    }
  });

  $("#btn-drd-play").click(() => {
    $("#dropdown-play")
      .css({
        "min-width": "140px",
        top: "35px",
        right: "-40px",
      })
      .toggle();
  });

  // $('#playback').click(function(e) {
  //     $('#dropdown-play').hide();
  // });

  $("#playSuite").click(function (e) {
    $("#dropdown-play").hide();
  });

  $("#playSuites").click(function (e) {
    $("#dropdown-play").hide();
  });

  // check sign in status on startup
  browser.storage.local.get("segment").then(async (result) => {
    let checkedResult = await browser.storage.local.get("checkLoginData");

    if (result.segment?.user && checkedResult.checkLoginData?.isActived) {
      // Verify the stored authentication is still valid
      const authStatus = await AuthService.checkPortalAuthentication();
      if (authStatus.isAuthenticated) {
        $("#login-user").show();
        $("#login-button").hide();
        $("#logout-info").html(result.segment.user);
        console.log("Startup: User is authenticated");
      } else {
        console.log("Startup: Stored authentication is invalid, clearing state");
        await logout();
      }
    } else {
      // Try to check authentication status on startup
      console.log("Startup: No stored authentication, checking current status");
      setTimeout(async () => {
        await updateLoginStatus();
      }, 1000);
    }
  });

  browser.storage.onChanged.addListener(async (changes, areaName) => {
    if (Object.keys(changes).includes("checkLoginData")) {
      if (
        changes.checkLoginData.newValue.user &&
        changes.checkLoginData.newValue.isActived
      ) {
        const user = changes.checkLoginData.newValue.user;
        $("#login-user").show();
        $("#login-button").hide();
        $("#logout-info").html(user);
      }
    }
  });

  // Function to manually update login status
  async function updateLoginStatus() {
    try {
      console.log("Attempting to update login status...");
      
      // Use the simplified portal authentication check
      const authStatus = await AuthService.checkPortalAuthentication();
      console.log("Portal authentication status:", authStatus);
      
      if (authStatus.isAuthenticated && authStatus.user) {
        const user = authStatus.user;
        const email = user.email || user.user_info || user.username || "user@testoriumz.com";
        console.log("User authenticated:", email);
        
        // Update storage
        const result = await getCheckLoginData();
        let checkLoginData = result.checkLoginData;
        checkLoginData.isActived = true;
        checkLoginData.hasLoggedIn = true;
        checkLoginData.user = email;
        await browser.storage.local.set(result);

        // Update UI
        $("#login-user").show();
        $("#login-button").hide();
        $("#logout-info").html(email);
        console.log("UI updated to show logged in user");

        // Update segment tracking
        await setSegmentUser(email);
        await trackingLogin();
        
        console.log("Login status updated successfully");
        return true;
      } else {
        // Try simple auth check as fallback
        console.log("Main auth check failed, trying simple auth check...");
        const simpleAuthStatus = await AuthService.simpleAuthCheck();
        console.log("Simple auth check result:", simpleAuthStatus);
        
        if (simpleAuthStatus.isAuthenticated && simpleAuthStatus.user) {
          const user = simpleAuthStatus.user;
          const email = user.email || user.user_info || user.username || "user@testoriumz.com";
          console.log("User authenticated via simple check:", email);
          
          // Update storage
          const result = await getCheckLoginData();
          let checkLoginData = result.checkLoginData;
          checkLoginData.isActived = true;
          checkLoginData.hasLoggedIn = true;
          checkLoginData.user = email;
          await browser.storage.local.set(result);

          // Update UI
          $("#login-user").show();
          $("#login-button").hide();
          $("#logout-info").html(email);
          console.log("UI updated to show logged in user (simple check)");

          // Update segment tracking
          await setSegmentUser(email);
          await trackingLogin();
          
          console.log("Login status updated successfully via simple check");
          return true;
        } else {
          console.log("User not authenticated, clearing login state");
          // Clear login state if not authenticated
          await logout();
          return false;
        }
      }
    } catch (error) {
      console.error("Error updating login status:", error);
      return false;
    }
  }

  // Enhanced login button click handler
  $("#login-button").click(async () => {
    console.log("Login button clicked");
    
    // Open the login page
    await AuthService.openUniversalLoginUrl();
    
    // Start monitoring for authentication
    await monitorAuthenticationStatus();
  });

  // Function to monitor authentication status after login
  async function monitorAuthenticationStatus() {
    console.log("Starting authentication monitoring...");
    
    // Check every 2 seconds for up to 2 minutes
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes
    
    const checkInterval = setInterval(async () => {
      attempts++;
      console.log(`Authentication check attempt ${attempts}/${maxAttempts}`);
      
      const success = await updateLoginStatus();
      
      if (success) {
        console.log("Authentication successful, stopping monitoring");
        clearInterval(checkInterval);
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.log("Authentication monitoring timeout");
        clearInterval(checkInterval);
      }
    }, 2000);
  }

  // Periodic login status check (every 5 minutes instead of 30 seconds to reduce API calls)
  setInterval(async () => {
    console.log("Periodic authentication check");
    await updateLoginStatus();
  }, 300000); // 5 minutes

  // Global function for debugging - can be called from console
  window.testLoginStatus = async () => {
    console.log("Manual login status test triggered");
    await updateLoginStatus();
  };

  // Additional test function specifically for portal authentication
  window.testPortalAuth = async () => {
    console.log("Testing portal authentication directly...");
    try {
      const authStatus = await AuthService.checkPortalAuthentication();
      console.log("Portal auth result:", authStatus);
      
      if (authStatus.isAuthenticated) {
        console.log("Portal authentication successful!");
        await updateLoginStatus();
      } else {
        console.log("Portal authentication failed - user not logged in");
        // Show current UI state
        console.log("Current UI state:");
        console.log("- Login button visible:", $("#login-button").is(":visible"));
        console.log("- Login user visible:", $("#login-user").is(":visible"));
        console.log("- Logout info text:", $("#logout-info").text());
      }
    } catch (error) {
      console.error("Portal auth test error:", error);
    }
  };

  // Comprehensive debugging function
  window.debugAuth = async () => {
    console.log("=== AUTHENTICATION DEBUG REPORT ===");
    
    // Check if portal tabs exist
    const tabs = await browser.tabs.query({ url: "*://reporting.linkfields.com/*" });
    console.log("Portal tabs found:", tabs.length);
    
    if (tabs.length > 0) {
      console.log("Portal tab URL:", tabs[0].url);
      
      // Try to extract auth data from portal
      try {
        const results = await browser.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            return {
              url: window.location.href,
              hasDashboardContent: document.body.innerHTML.includes('ALL DASHBOARDS'),
              hasAddButton: document.body.innerHTML.includes('Add New Dashboard'),
              hasEditButtons: document.body.innerHTML.includes('EDIT'),
              hasDeleteButtons: document.body.innerHTML.includes('DELETE'),
              localStorageKeys: Object.keys(localStorage),
              sessionStorageKeys: Object.keys(sessionStorage),
              cookies: document.cookie,
              bodyText: document.body.textContent.substring(0, 500) + '...'
            };
          }
        });
        
        if (results && results[0] && results[0].result) {
          const portalData = results[0].result;
          console.log("Portal page data:", portalData);
        }
      } catch (error) {
        console.log("Error extracting portal data:", error);
      }
    }
    
    // Check stored authentication data
    const storedData = await browser.storage.local.get([
      "accessToken", "refreshToken", "userInfo", "checkLoginData", "segment"
    ]);
    console.log("Stored authentication data:", storedData);
    
    // Check current UI state
    console.log("Current UI state:");
    console.log("- Login button visible:", $("#login-button").is(":visible"));
    console.log("- Login user visible:", $("#login-user").is(":visible"));
    console.log("- Logout info text:", $("#logout-info").text());
    
    // Test authentication check
    console.log("Testing authentication check...");
    const authStatus = await AuthService.checkPortalAuthentication();
    console.log("Authentication status:", authStatus);
    
    console.log("=== END DEBUG REPORT ===");
  };

  // Listen for authentication loss notifications from background script
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "auth-lost") {
      console.log("Received auth-lost notification, updating UI");
      $("#login-user").hide();
      $("#login-button").show();
      $("#logout-dropdown").hide();
    }
    
    if (message.type === "portal-auth-success") {
      console.log("Received portal auth success notification, updating UI");
      if (message.user) {
        const email = message.user.email || message.user.user_info || message.user.username || "user@testoriumz.com";
        
        // Update storage
        const result = await getCheckLoginData();
        let checkLoginData = result.checkLoginData;
        checkLoginData.isActived = true;
        checkLoginData.hasLoggedIn = true;
        checkLoginData.user = email;
        await browser.storage.local.set(result);

        // Update UI
        $("#login-user").show();
        $("#login-button").hide();
        $("#logout-info").html(email);

        // Update segment tracking
        await setSegmentUser(email);
        await trackingLogin();
        
        console.log("UI updated from portal auth success");
      }
    }
  });

  $("#login-user").click(() => {
    $("#logout-dropdown").toggle();
  });

  $("#refresh-login-status").click(async () => {
    await updateLoginStatus();
    $("#logout-dropdown").toggle();
  });

  $("#check-portal-auth").click(async () => {
    console.log("Check Portal Auth button clicked");
    await window.testPortalAuth();
    $("#logout-dropdown").toggle();
  });

  $("#logout-user").click(() => {
    // Clear timeout on signing out manually
    clearTimeout(setLoginTokenTimeout);

    logout();
    $("#logout-dropdown").toggle();
  });

  chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (tab.url.startsWith(REDIRECT_URI) && changeInfo.status === "loading") {
      const gotUrl = new URLSearchParams(tab.url);
      const codeParam = gotUrl.get("code");
      if (!codeParam) {
        return;
      }
      AuthService.getToken(codeParam)
        .then((response) => response.json())
        .then(async (data) => {
          const accessToken = data.access_token;
          await setUserAfterLogin(accessToken);
          const refreshToken = data.refresh_token;
          await browser.storage.local.set({ refreshToken });
          await chrome.tabs.remove(tabId);
          await browser.runtime.sendMessage("focus-panel");
          await browser.storage.local.remove("codePKCE");
          updateTestOpsLoginToken(accessToken);
          await browser.runtime.sendMessage("notify-logged-in");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
});
