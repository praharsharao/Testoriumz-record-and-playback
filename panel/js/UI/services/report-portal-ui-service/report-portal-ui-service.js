import ReportPortalService from "../report-portal-service/report-portal-service.js";

export default class ReportPortalUIService {
  static async updateStatusIndicator() {
    const statusElement = document.getElementById("report-portal-status");
    const statusTextElement = document.getElementById("report-portal-status-text");
    
    if (!statusElement || !statusTextElement) {
      console.log("Report portal status elements not found");
      return;
    }

    try {
      // First check if user is authenticated
      const isAuthenticated = await ReportPortalService.isAuthenticated();
      console.log("Authentication status:", isAuthenticated);
      
      if (!isAuthenticated) {
        console.log("User not authenticated, hiding status indicator");
        statusElement.style.display = "none";
        return;
      }

      // Then check the actual connection status
      const connectionStatus = await ReportPortalService.checkConnectionStatus();
      console.log("Connection status:", connectionStatus);
      
      if (connectionStatus.connected) {
        console.log("User is connected, showing connected status");
        statusElement.style.display = "flex";
        statusElement.className = "sub_btn connected";
        statusTextElement.textContent = "Connected";
        
        // Set appropriate title based on connection status
        if (connectionStatus.data?.status === "limited") {
          statusElement.title = `Report Portal: ${connectionStatus.message} - Click to open dashboard`;
          statusElement.style.opacity = "0.7";
        } else {
          statusElement.title = `Report Portal: ${connectionStatus.message} - Click to open dashboard`;
          statusElement.style.opacity = "1";
        }
        
        // Add a subtle animation to show it's connected
        statusElement.style.animation = "pulse 2s infinite";
      } else {
        console.log("User is not connected, showing disconnected status");
        statusElement.style.display = "flex";
        statusElement.className = "sub_btn disconnected";
        statusTextElement.textContent = "Disconnected";
        statusElement.title = `Report Portal: ${connectionStatus.message} - Click to reconnect`;
        statusElement.style.animation = "none";
        statusElement.style.opacity = "1";
      }
    } catch (error) {
      console.error("Failed to update status indicator:", error);
      // Show error status
      statusElement.style.display = "flex";
      statusElement.className = "sub_btn error";
      statusTextElement.textContent = "Error";
      statusElement.title = `Report Portal: Connection error - Click to retry`;
      statusElement.style.animation = "none";
      statusElement.style.opacity = "0.8";
    }
  }

  static async refreshConnectionStatus() {
    try {
      await this.updateStatusIndicator();
    } catch (error) {
      console.error("Failed to refresh connection status:", error);
    }
  }

  static async initializeStatusIndicator() {
    console.log("Initializing report portal status indicator");
    await this.updateStatusIndicator();
    
    // Add click handler to open report portal dashboard
    const statusElement = document.getElementById("report-portal-status");
    if (statusElement) {
      statusElement.addEventListener("click", async () => {
        try {
          console.log("Report portal status indicator clicked");
          // Check connection status first
          const connectionStatus = await ReportPortalService.checkConnectionStatus();
          
          if (connectionStatus.connected) {
            // If connected, open the dashboard
            console.log("Opening report portal dashboard");
            await ReportPortalService.openDashboard();
          } else {
            // If not connected, try to reconnect and then open portal
            console.log("Opening report portal (not connected)");
            await ReportPortalService.openReportPortal();
          }
        } catch (error) {
          console.error("Failed to open report portal:", error);
          // Fallback to opening the portal
          await ReportPortalService.openReportPortal();
        }
      });
    }
  }

  static async hideConnectionStatus() {
    const statusElement = document.getElementById("report-portal-status");
    if (statusElement) {
      statusElement.style.display = "none";
    }
  }

  static async redirectToDashboard() {
    try {
      await ReportPortalService.openDashboard();
    } catch (error) {
      console.error("Failed to redirect to dashboard:", error);
      // Fallback to opening the portal
      await ReportPortalService.openReportPortal();
    }
  }
} 