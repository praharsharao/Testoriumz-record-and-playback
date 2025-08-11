import { setBackupDataInterval } from "../../services/test-ops-service/test-ops-service.js";
import { trackingSegment } from "../../services/tracking-service/segment-tracking-service.js";
import ReportPortalUIService from "../../services/report-portal-ui-service/report-portal-ui-service.js";

$(document).ready(function () {
  $("#ka-open").on("click", async function () {
    try {
      // Use our report portal integration to open the dashboard
      await ReportPortalUIService.redirectToDashboard();
      
      // Refresh after auto login on Report Portal website
      setTimeout(() => {
        refreshStatusBar();
      }, 3000);
    } catch (error) {
      console.error("Failed to open report portal dashboard:", error);
      // Fallback to the original implementation
      window.open(testOpsUrls.loginToTestOps);
    }
  });

  $("#test-ops-back-up-data").click(function () {
    getProjects()
      .then(() => {
        backupData();
        updateBackupStatus(`Backing up data …`);
        $("#backup-restore-btn").css("display", "none");
        setTimeout(() => {
          showBackupEnabledStatus();
          trackingSegment("kru_backup_data_to_testops", { success: true });
        }, 2000);
      })
      .catch(() => {
        showTestOpsLoginDialog();
        showBackupDisabledStatus();
        trackingSegment("kru_backup_data_to_testops", { success: false });
      });
  });

  setBackupDataInterval();
});
