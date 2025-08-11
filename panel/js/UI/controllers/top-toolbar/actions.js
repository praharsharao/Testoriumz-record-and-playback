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
    console.log("Startup: Checking authentication status...");
    
    // Always try to get fresh authentication data on startup
    setTimeout(async () => {
      try {
        console.log("Startup: Running fresh authentication check...");
        const authResult = await updateLoginStatus();
        console.log("Startup: Authentication check result:", authResult);
        
        if (!authResult) {
          console.log("Startup: No active authentication found, showing login button");
          updateUIState(false);
        }
      } catch (error) {
        console.error("Startup: Error checking authentication:", error);
        updateUIState(false);
      }
    }, 1000);
  });

  browser.storage.onChanged.addListener(async (changes, areaName) => {
    if (Object.keys(changes).includes("checkLoginData")) {
      if (
        changes.checkLoginData.newValue.user &&
        changes.checkLoginData.newValue.isActived
      ) {
        const user = changes.checkLoginData.newValue.user;
        updateUIState(true, user);
      } else {
        updateUIState(false);
      }
    }
  });

  // Function to manually update login status
  async function updateLoginStatus() {
    try {
      console.log("Attempting to update login status...");
      
      // First, try API-based authentication check (this gets real user data)
      console.log("Trying API-based authentication check...");
      const apiAuthStatus = await AuthService.checkAuthViaAPI();
      console.log("API authentication status:", apiAuthStatus);
      
      if (apiAuthStatus.isAuthenticated && apiAuthStatus.user) {
        const user = apiAuthStatus.user;
        const email = user.email || user.user_info || user.username || "user@testoriumz.com";
        console.log("User authenticated via API:", email);
        
        // Update storage
        const result = await getCheckLoginData();
        let checkLoginData = result.checkLoginData;
        checkLoginData.isActived = true;
        checkLoginData.hasLoggedIn = true;
        checkLoginData.user = email;
        await browser.storage.local.set(result);

        // Update UI
        updateUIState(true, email);
        console.log("UI updated to show logged in user (API)");

        // Update segment tracking
        await setSegmentUser(email);
        await trackingLogin();
        
        console.log("Login status updated successfully via API");
        return true;
      }
      
      // If API check fails, try ReportPortal-style authentication check
      console.log("API check failed, trying ReportPortal-style authentication check...");
      const rpAuthStatus = await AuthService.checkReportPortalAuth();
      console.log("ReportPortal authentication status:", rpAuthStatus);
      
      if (rpAuthStatus.isAuthenticated && rpAuthStatus.user) {
        const user = rpAuthStatus.user;
        const email = user.email || user.user_info || user.username || "user@testoriumz.com";
        console.log("User authenticated via ReportPortal check:", email);
        
        // Update storage
        const result = await getCheckLoginData();
        let checkLoginData = result.checkLoginData;
        checkLoginData.isActived = true;
        checkLoginData.hasLoggedIn = true;
        checkLoginData.user = email;
        await browser.storage.local.set(result);

        // Update UI
        updateUIState(true, email);
        console.log("UI updated to show logged in user (ReportPortal)");

        // Update segment tracking
        await setSegmentUser(email);
        await trackingLogin();
        
        console.log("Login status updated successfully via ReportPortal check");
        return true;
      }
      
      // If ReportPortal check fails, try portal authentication check
      console.log("ReportPortal check failed, trying portal authentication check...");
      const authStatus = await AuthService.checkPortalAuthentication();
      console.log("Portal authentication status:", authStatus);
      
      if (authStatus.isAuthenticated && authStatus.user) {
        const user = authStatus.user;
        const email = user.email || user.user_info || user.username || "user@testoriumz.com";
        console.log("User authenticated via portal check:", email);
        
        // Update storage
        const result = await getCheckLoginData();
        let checkLoginData = result.checkLoginData;
        checkLoginData.isActived = true;
        checkLoginData.hasLoggedIn = true;
        checkLoginData.user = email;
        await browser.storage.local.set(result);

        // Update UI
        updateUIState(true, email);
        console.log("UI updated to show logged in user (portal check)");

        // Update segment tracking
        await setSegmentUser(email);
        await trackingLogin();
        
        console.log("Login status updated successfully via portal check");
        return true;
      } else {
        // Try simple auth check as final fallback
        console.log("Portal check failed, trying simple auth check...");
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
          updateUIState(true, email);
          console.log("UI updated to show logged in user (simple check)");

          // Update segment tracking
          await setSegmentUser(email);
          await trackingLogin();
          
          console.log("Login status updated successfully via simple check");
          return true;
        } else {
          console.log("User not authenticated, clearing login state");
          // Clear login state if not authenticated
          updateUIState(false);
          return false;
        }
      }
    } catch (error) {
      console.error("Error updating login status:", error);
      updateUIState(false);
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
    
    // Test API authentication first
    console.log("Testing API authentication...");
    const apiAuth = await AuthService.checkAuthViaAPI();
    console.log("API auth result:", apiAuth);
    
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

  // Function to force refresh login status and clear cache
  async function forceRefreshLoginStatus() {
    try {
      console.log("Force refreshing login status...");
      
      // Clear all stored authentication data first
      await browser.storage.local.remove("accessToken");
      await browser.storage.local.remove("refreshToken");
      await browser.storage.local.remove("checkLoginData");
      await browser.storage.local.remove("userInfo");
      await browser.storage.local.remove("authToken");
      await browser.storage.local.remove("lastAuthCheck");
      
      console.log("Cleared all stored authentication data");
      
      // Wait a moment for the portal to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now try to update login status
      const result = await updateLoginStatus();
      
      if (result) {
        console.log("Login status refreshed successfully");
      } else {
        console.log("Failed to refresh login status");
      }
      
      return result;
    } catch (error) {
      console.error("Error force refreshing login status:", error);
      return false;
    }
  }

  // Add click handler for force refresh
  $("#refresh-login-status").click(async () => {
    console.log("Refresh login status clicked");
    await forceRefreshLoginStatus();
  });

  // Add click handler for check portal auth
  $("#check-portal-auth").click(async () => {
    console.log("Check portal auth clicked");
    await debugAuth();
  });

  // Function to force logout by navigating to portal
  async function forceLogout() {
    try {
      console.log("=== Force Logout by Navigating to Portal ===");
      
      // Find or create portal tab
      let portalTabs = await browser.tabs.query({url: "https://reporting.linkfields.com/*"});
      
      if (portalTabs.length === 0) {
        console.log("No portal tab found, creating new one...");
        const newTab = await browser.tabs.create({
          url: "https://reporting.linkfields.com/ui/#login"
        });
        portalTabs = [newTab];
      }
      
      console.log("Portal tab ready for logout");
      
      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Execute logout script
      const results = await browser.scripting.executeScript({
        target: { tabId: portalTabs[0].id },
        func: () => {
          try {
            console.log("Force logout executing...");
            
            // Clear everything immediately
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear all cookies
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i];
              const eqPos = cookie.indexOf("=");
              const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.linkfields.com";
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=linkfields.com";
            }
            
            // Force redirect to login
            window.location.replace('https://reporting.linkfields.com/ui/#login');
            
            return { success: true, message: "Force logout completed" };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
      });
      
      console.log("Force logout results:", results);
      
      // Clear extension storage
      const result = await getCheckLoginData();
      let checkLoginData = result.checkLoginData;
      checkLoginData.isActived = false;
      checkLoginData.hasLoggedIn = false;
      checkLoginData.user = null;
      await browser.storage.local.set(result);
      
      return { success: true, message: "Force logout completed" };
      
    } catch (error) {
      console.error("Error in force logout:", error);
      return { success: false, error: error.message };
    }
  }

  // Function to show beautiful notification
  function showNotification(message, type = 'info') {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#007bff',
      warning: '#ffc107'
    };
    
    const icon = {
      success: '✓',
      error: '✗',
      info: 'ℹ',
      warning: '⚠'
    };
    
    const notification = $(`
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 18px;">${icon[type]}</span>
          <span>${message}</span>
        </div>
      </div>
    `);
    
    $('body').append(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.fadeOut(300, function() {
        $(this).remove();
      });
    }, 4000);
  }

  // Function to update UI based on login status
  function updateUIState(isLoggedIn, userEmail = null) {
    if (isLoggedIn && userEmail) {
      // Show logged in state - profile icon with dropdown
      $("#login-button").hide();
      $("#login-user").show();
      $("#logout-info").html(userEmail);
    } else {
      // Show logged out state - only sign in button
      $("#login-user").hide();
      $("#login-button").show();
      $("#logout-dropdown").hide();
    }
  }

  // Enhanced manual logout function with beautiful messages
  async function manualLogout() {
    try {
      console.log("=== Manual Logout ===");
      
      showNotification("Logging out from portal...", "info");
      
      // Use force logout for reliable logout
      const logoutResult = await forceLogout();
      console.log("Logout result:", logoutResult);
      
      if (logoutResult && logoutResult.success) {
        // Update UI to show logged out state - only sign in button
        updateUIState(false);
        
        console.log("Logout completed successfully");
        showNotification("Successfully logged out! You have been signed out from the portal.", "success");
      } else {
        console.log("Logout failed:", logoutResult?.error);
        showNotification("Logout failed. Please try again or manually sign out from the portal.", "error");
      }
    } catch (error) {
      console.error("Error in manual logout:", error);
      showNotification("Logout error occurred. Please try again.", "error");
    }
  }

  // Auto-refresh login status every 30 seconds for better responsiveness
  setInterval(async () => {
    try {
      console.log("Auto-refreshing login status...");
      const result = await updateLoginStatus();
      console.log("Auto-refresh result:", result);
    } catch (error) {
      console.log("Auto-refresh error:", error);
    }
  }, 30 * 1000); // 30 seconds

  // Immediate refresh on startup
  setTimeout(async () => {
    try {
      console.log("Initial login status check...");
      const result = await updateLoginStatus();
      console.log("Initial check result:", result);
    } catch (error) {
      console.log("Initial check error:", error);
    }
  }, 1000);

  // Global function for manual refresh - can be called from console
  window.refreshLoginStatus = async () => {
    console.log("Manual login status refresh triggered");
    try {
      const result = await updateLoginStatus();
      console.log("Manual refresh result:", result);
      return result;
    } catch (error) {
      console.error("Manual refresh error:", error);
      return false;
    }
  };

  // Add click handler for logout only
  $("#logout-link").click(async function(e) {
    e.preventDefault();
    await manualLogout();
  });

  // Add CSS for notification animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

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
