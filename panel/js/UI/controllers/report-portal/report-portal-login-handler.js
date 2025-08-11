import AuthService from "../../services/auth-service/auth-service.js";
import ReportPortalService from "../../services/report-portal-service/report-portal-service.js";
import ReportPortalUIService from "../../services/report-portal-ui-service/report-portal-ui-service.js";

export default class ReportPortalLoginHandler {
  constructor() {
    this.initializeEventListeners();
    this.startStatusMonitoring();
  }

  initializeEventListeners() {
    // Handle sign-in button click to open ReportPortal login UI
    document.getElementById("login-button")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.openReportPortalLogin();
    });
  }

  openReportPortalLogin() {
    // Open ReportPortal login page in a new window/tab
    const loginUrl = "https://reporting.linkfields.com/ui/#login";
    
    try {
      // Try to open in a new popup window first
      browser.windows.create({
        url: loginUrl,
        type: "popup",
        width: 800,
        height: 600,
        focused: true,
      }).then((windowInfo) => {
        // Store the window ID to monitor for closure
        this.monitorLoginWindow(windowInfo.id);
      }).catch(() => {
        // Fallback to opening in a new tab if popup fails
        browser.tabs.create({
          url: loginUrl,
          active: true
        }).then((tabInfo) => {
          // Monitor the tab for completion
          this.monitorLoginTab(tabInfo.id);
        });
      });
    } catch (error) {
      console.error("Failed to open ReportPortal login:", error);
      // Final fallback - open in current tab
      window.open(loginUrl, "_blank");
    }
  }

  monitorLoginWindow(windowId) {
    // Monitor the popup window for closure
    browser.windows.onRemoved.addListener((removedWindowId) => {
      if (removedWindowId === windowId) {
        console.log("ReportPortal login window closed, checking authentication status");
        this.checkAuthenticationStatus();
      }
    });
  }

  monitorLoginTab(tabId) {
    // Monitor the tab for URL changes or closure
    browser.tabs.onUpdated.addListener((updatedTabId, changeInfo, tab) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        // Check if the user has been redirected to a dashboard or authenticated page
        if (tab.url && (tab.url.includes('/dashboard') || tab.url.includes('/ui/#dashboard'))) {
          console.log("User appears to be authenticated, checking status");
          this.checkAuthenticationStatus();
        }
      }
    });

    browser.tabs.onRemoved.addListener((removedTabId) => {
      if (removedTabId === tabId) {
        console.log("ReportPortal login tab closed, checking authentication status");
        this.checkAuthenticationStatus();
      }
    });
  }

  async checkAuthenticationStatus() {
    try {
      console.log("Checking authentication status...");
      
      // Check if user is authenticated
      const isAuthenticated = await ReportPortalService.isAuthenticated();
      console.log("Authentication status:", isAuthenticated);
      
      if (isAuthenticated) {
        // User is authenticated, update UI and show connected status
        await this.updateUIForAuthenticatedUser();
        await this.showConnectedStatus();
      } else {
        console.log("User not authenticated yet");
      }
    } catch (error) {
      console.error("Failed to check authentication status:", error);
    }
  }

  async updateUIForAuthenticatedUser() {
    try {
      // Get user info from storage
      const result = await browser.storage.local.get("checkLoginData");
      if (result.checkLoginData?.user) {
        // Update UI to show logged-in state
        const loginUser = document.getElementById("login-user");
        const loginButton = document.getElementById("login-button");
        const logoutInfo = document.getElementById("logout-info");
        
        if (loginUser && loginButton && logoutInfo) {
          loginUser.style.display = "block";
          loginButton.style.display = "none";
          logoutInfo.textContent = result.checkLoginData.user;
        }
      }
    } catch (error) {
      console.error("Failed to update UI for authenticated user:", error);
    }
  }

  async showConnectedStatus() {
    try {
      // Initialize and show the report portal status indicator
      await ReportPortalUIService.initializeStatusIndicator();
      console.log("Connected status indicator should now be visible");
    } catch (error) {
      console.error("Failed to show connected status:", error);
    }
  }

  startStatusMonitoring() {
    // Check authentication status periodically
    setInterval(async () => {
      try {
        await this.checkAuthenticationStatus();
      } catch (error) {
        console.error("Status monitoring error:", error);
      }
    }, 30000); // Check every 30 seconds

    // Also check when the page becomes visible (user returns from ReportPortal)
    document.addEventListener("visibilitychange", async () => {
      if (!document.hidden) {
        console.log("Page became visible, checking authentication status");
        await this.checkAuthenticationStatus();
      }
    });

    // Check when the window gains focus
    window.addEventListener("focus", async () => {
      console.log("Window gained focus, checking authentication status");
      await this.checkAuthenticationStatus();
    });

    // Check immediately on startup
    setTimeout(async () => {
      console.log("Initial authentication status check");
      await this.checkAuthenticationStatus();
    }, 2000); // Wait 2 seconds after page load
  }
}

// Initialize the handler when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ReportPortalLoginHandler();
}); 