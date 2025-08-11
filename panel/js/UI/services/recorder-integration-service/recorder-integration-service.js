import ReportPortalService from "../report-portal-service/report-portal-service.js";
import { getSelectedCase } from "../../view/testcase-grid/selected-case.js";
import { getSelectedSuite } from "../../view/testcase-grid/selected-suite.js";
import { getRecordsArray } from "../../view/records-grid/get-records-array.js";

export default class RecorderIntegrationService {
  static async uploadTestDataToReportPortal() {
    try {
      if (!await ReportPortalService.isAuthenticated()) {
        console.log("User not authenticated with report portal, skipping upload");
        return;
      }

      const selectedCase = getSelectedCase();
      const selectedSuite = getSelectedSuite();
      const records = getRecordsArray();

      if (!selectedCase || !records || records.length === 0) {
        console.log("No test data available for upload");
        return;
      }

      const testData = {
        testCase: {
          id: selectedCase.id,
          name: selectedCase.name,
          description: selectedCase.description || ""
        },
        testSuite: selectedSuite ? {
          id: selectedSuite.id,
          name: selectedSuite.name,
          description: selectedSuite.description || ""
        } : null,
        records: records.map(record => ({
          command: record.command,
          target: record.target,
          value: record.value,
          comment: record.comment || ""
        })),
        metadata: {
          recorderVersion: browser.runtime.getManifest().version,
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent
        }
      };

      const testResults = {
        executionTime: new Date().toISOString(),
        status: "completed",
        duration: this.calculateExecutionDuration(),
        screenshots: this.getScreenshots(),
        logs: this.getExecutionLogs()
      };

      await ReportPortalService.uploadRecorderData(testData, testResults);
      console.log("Test data successfully uploaded to report portal");
    } catch (error) {
      console.error("Failed to upload test data to report portal:", error);
    }
  }

  static calculateExecutionDuration() {
    // This would need to be implemented based on how execution time is tracked
    // For now, returning a placeholder
    return Date.now();
  }

  static getScreenshots() {
    // This would need to be implemented based on how screenshots are stored
    // For now, returning an empty array
    return [];
  }

  static getExecutionLogs() {
    const logcontainer = document.getElementById("logcontainer");
    if (!logcontainer) {
      return [];
    }

    const logs = [];
    for (let i = 0; i < logcontainer.childNodes.length; i++) {
      const node = logcontainer.childNodes[i];
      if (node.textContent) {
        logs.push({
          message: node.textContent,
          timestamp: new Date().toISOString(),
          level: node.className || "info"
        });
      }
    }
    return logs;
  }

  static async onTestExecutionComplete() {
    await this.uploadTestDataToReportPortal();
  }

  static async onTestSuiteExecutionComplete() {
    await this.uploadTestDataToReportPortal();
  }

  static async onRecordingComplete() {
    await this.uploadTestDataToReportPortal();
  }
} 