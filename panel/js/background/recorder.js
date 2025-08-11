import { createTestSuite, findTestSuiteById } from "../UI/services/data-service/test-suite-service.js";
import { renderNewTestSuite } from "../UI/view/testcase-grid/render-new-test-suite.js";
import { createTestCase, findTestCaseById } from "../UI/services/data-service/test-case-service.js";
import { renderNewTestCase } from "../UI/view/testcase-grid/render-new-test-case.js";
import { trackingCreateTestCase, trackingCreateTestSuite } from "../UI/services/tracking-service/segment-tracking-service.js";
import { deleteCommand } from "../UI/services/records-grid-service/actions.js";
import { getSelectedCase } from "../UI/view/testcase-grid/selected-case.js";
import { addCommandAuto, addCommandBeforeLastCommand } from "../UI/view/records-grid/add-command.js";
import { getSelectedRecord } from "../UI/view/records-grid/selected-records.js";
import { getRecordsArray } from "../UI/view/records-grid/get-records-array.js";
import { getCommandName, getCommandTarget, getCommandValue } from "../UI/view/records-grid/record-utils.js";
import { getSelectedSuite } from "../UI/view/testcase-grid/selected-suite.js";
import { commandHistory } from "../UI/services/records-grid-service/command-history.js";

// TODO: seperate UI
class BackgroundRecorder {
    constructor() {
        this.currentRecordingTabId = {};
        this.currentRecordingWindowId = {};
        this.currentRecordingFrameLocation = {};
        this.openedTabNames = {};
        this.openedTabIds = {};
        this.openedTabCount = {};

        this.openedWindowIds = {};
        this.contentWindowId = -1;
        this.selfWindowId = -1;
        this.attached = false;
        this.rebind();
    }

    // TODO: rename method
    tabsOnActivatedHandler(activeInfo) {
        let testCase = getSelectedCase();
        if (!testCase) {
            return;
        }
        let testCaseId = testCase.id;
        if (!this.openedTabIds[testCaseId]) {
            return;
        }

        var self = this;
        // Because event listener is so fast that selectWindow command is added
        // before other commands like clicking a link to browse in new tab.
        // Delay a little time to add command in order.
        setTimeout(function () {
            if (self.currentRecordingTabId[testCaseId] === activeInfo.tabId && self.currentRecordingWindowId[testCaseId] === activeInfo.windowId)
                return;
            // If no command has been recorded, ignore selectWindow command
            // until the user has select a starting page to record the commands
            if (getRecordsArray().length === 0)
                return;
            // Ignore all unknown tabs, the activated tab may not derived from
            // other opened tabs, or it may managed by other SideeX panels
            if (self.openedTabIds[testCaseId][activeInfo.tabId] == undefined)
                return;
            // Tab information has existed, add selectWindow command
            self.currentRecordingTabId[testCaseId] = activeInfo.tabId;
            self.currentRecordingWindowId[testCaseId] = activeInfo.windowId;
            self.currentRecordingFrameLocation[testCaseId] = "root";
            addCommandAuto("selectWindow", [[self.openedTabIds[testCaseId][activeInfo.tabId]]], "");
        }, 150);
    }

    windowsOnFocusChangedHandler(windowId) {
        let testCase = getSelectedCase();
        if (!testCase) {
            return;
        }
        let testCaseId = testCase.id;
        if (!this.openedTabIds[testCaseId]) {
            return;
        }

        if (windowId === browser.windows.WINDOW_ID_NONE) {
            // In some Linux window managers, WINDOW_ID_NONE will be listened before switching
            // See MDN reference :
            // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/windows/onFocusChanged
            return;
        }

        // If the activated window is the same as the last, just do nothing
        // selectWindow command will be handled by tabs.onActivated listener
        // if there also has a event of switching a activated tab
        if (this.currentRecordingWindowId[testCaseId] === windowId)
            return;

        let self = this;

        browser.tabs.query({
            windowId: windowId,
            active: true
        }).then(function (tabs) {
            if (tabs.length === 0 || self.isPrivilegedPage(tabs[0].url)) {
                return;
            }

            // The activated tab is not the same as the last
            if (tabs[0].id !== self.currentRecordingTabId[testCaseId]) {
                // If no command has been recorded, ignore selectWindow command
                // until the user has select a starting page to record commands
                if (getRecordsArray().length === 0)
                    return;

                // Ignore all unknown tabs, the activated tab may not derived from
                // other opened tabs, or it may managed by other SideeX panels
                if (self.openedTabIds[testCaseId][tabs[0].id] == undefined)
                    return;

                // Tab information has existed, add selectWindow command
                self.currentRecordingWindowId[testCaseId] = windowId;
                self.currentRecordingTabId[testCaseId] = tabs[0].id;
                self.currentRecordingFrameLocation[testCaseId] = "root";
                addCommandAuto("selectWindow", [[self.openedTabIds[testCaseId][tabs[0].id]]], "");
            }
        });
    }

    tabsOnRemovedHandler(tabId, removeInfo) {
        let testCase = getSelectedCase();
        if (!testCase) {
            return;
        }
        let testCaseId = testCase.id;
        if (!this.openedTabIds[testCaseId]) {
            return;
        }

        if (this.openedTabIds[testCaseId][tabId] != undefined) {
            if (this.currentRecordingTabId[testCaseId] !== tabId) {
                addCommandAuto("selectWindow", [
                    [this.openedTabIds[testCaseId][tabId]]
                ], "");
                addCommandAuto("close", [
                    [this.openedTabIds[testCaseId][tabId]]
                ], "");
                addCommandAuto("selectWindow", [
                    [this.openedTabIds[testCaseId][this.currentRecordingTabId[testCaseId]]]
                ], "");
            } else {
                addCommandAuto("close", [
                    [this.openedTabIds[testCaseId][tabId]]
                ], "");
            }
            delete this.openedTabNames[testCaseId][this.openedTabIds[testCaseId][tabId]];
            delete this.openedTabIds[testCaseId][tabId];
            this.currentRecordingFrameLocation[testCaseId] = "root";
        }
    }

    webNavigationOnCreatedNavigationTargetHandler(details) {
        let testCase = getSelectedCase();
        if (!testCase)
            return;
        let testCaseId = testCase.id;
        if (this.openedTabIds[testCaseId][details.sourceTabId] != undefined) {
            this.openedTabNames[testCaseId]["win_ser_" + this.openedTabCount[testCaseId]] = details.tabId;
            this.openedTabIds[testCaseId][details.tabId] = "win_ser_" + this.openedTabCount[testCaseId];
            if (details.windowId != undefined) {
                this.setOpenedWindow(details.windowId);
            } else {
                // Google Chrome does not support windowId.
                // Retrieve windowId from tab information.
                let self = this;
                browser.tabs.get(details.tabId)
                    .then(function (tabInfo) {
                        self.setOpenedWindow(tabInfo.windowId);
                    });
            }
            this.openedTabCount[testCaseId]++;
        }
    };

    addCommandMessageHandler(message, sender, sendRequest) {
        if (!message.command || this.openedWindowIds[sender.tab.windowId] == undefined)
            return;
      
        const selectedTestSuite = getSelectedSuite();
        const selectedTestCase = getSelectedCase();

        let testSuite;
        let testCase;
        if (!selectedTestSuite) {
            testSuite = createTestSuite("Untitled Test Suite");
            renderNewTestSuite("Untitled Test Suite", testSuite.id);
            trackingCreateTestSuite('Record', 'Untitled Test Suite');
        } else {
            const testSuiteID = selectedTestSuite.id;
            testSuite = findTestSuiteById(testSuiteID);
        }
        if (!selectedTestCase) {
            testCase = createTestCase("Untitled Test Case", testSuite);
            renderNewTestCase("Untitled Test Case", testCase.id);
            trackingCreateTestCase('Record', 'Untitled Test Case');
        } else {
            const testCaseID = selectedTestCase.id;
            testCase = findTestCaseById(testCaseID);
        }

        let testCaseId = getSelectedCase().id;

        if (!this.openedTabIds[testCaseId]) {
            this.openedTabIds[testCaseId] = {};
            this.openedTabNames[testCaseId] = {};
            this.currentRecordingFrameLocation[testCaseId] = "root";
            this.currentRecordingTabId[testCaseId] = sender.tab.id;
            this.currentRecordingWindowId[testCaseId] = sender.tab.windowId;
            this.openedTabCount[testCaseId] = 1;
        }

        if (Object.keys(this.openedTabIds[testCaseId]).length === 0) {
            this.currentRecordingTabId[testCaseId] = sender.tab.id;
            this.currentRecordingWindowId[testCaseId] = sender.tab.windowId;
            this.openedTabNames[testCaseId]["win_ser_local"] = sender.tab.id;
            this.openedTabIds[testCaseId][sender.tab.id] = "win_ser_local";
        }

        if (getRecordsArray().length === 0) {
            addCommandAuto("open", [
                [sender.tab.url]
            ], "");
            this.openedTabIds[testCaseId]['tabUrl'] = sender.tab.url;
        }

        if (this.openedTabIds[testCaseId][sender.tab.id] == undefined) {
            addCommandAuto("open", [
                [sender.tab.url]
            ], "");
            this.currentRecordingTabId[testCaseId] = sender.tab.id;
            this.currentRecordingWindowId[testCaseId] = sender.tab.windowId;
            this.openedTabNames[testCaseId]["win_ser_local"] = sender.tab.id;
            this.openedTabIds[testCaseId][sender.tab.id] = "win_ser_local";
            this.openedTabIds[testCaseId]['tabUrl'] = sender.tab.url;
            /* uncomment this for the following scenario
            user records 2 opened tabs and want to playback with those 2 tabs opened simultaneously
            //open new tab
            addCommandAuto("runScript", [
                [`window.open("${sender.tab.url}", "_blank");`]
            ], "");
            //set focus to that tab
            addCommandAuto("selectWindow", [
                [`win_ser_${this.openedTabCount[testCaseId]}`]
            ], "");
            this.openedTabNames[testCaseId]["win_ser_" + this.openedTabCount[testCaseId]] = sender.tab.id;
            this.openedTabIds[testCaseId][sender.tab.id] = "win_ser_" + this.openedTabCount[testCaseId];
            this.openedTabCount[testCaseId]++;
            this.currentRecordingTabId[testCaseId] = sender.tab.id;
            this.currentRecordingWindowId[testCaseId] = sender.tab.windowId;*/
        }

        // if exists record hasn't tabUrl, add command open when fill url
        if (!this.openedTabIds[testCaseId]['tabUrl'] && this.openedTabNames[testCaseId]["win_ser_local"] === sender.tab.id && message.command === 'checkForAutomated') {
            addCommandAuto("open", [
                [sender.tab.url]
            ], "");
            this.openedTabIds[testCaseId]['tabUrl'] = sender.tab.url;
        } else {
            //if new record add tabUrl, add command open
            if (this.openedTabIds[testCaseId]['tabUrl'] && !sender.tab.url.includes(this.openedTabIds[testCaseId]['tabUrl'])) {
                addCommandAuto("open", [
                    [sender.tab.url]
                ], "");
                this.openedTabIds[testCaseId]['tabUrl'] = sender.tab.url;
            }
            if (message.command === 'checkForAutomated') {
                return;
            }
        }

        if (message.frameLocation && message.frameLocation !== this.currentRecordingFrameLocation[testCaseId]) {
            let newFrameLevels = message.frameLocation.split(':');
            let oldFrameLevels = this.currentRecordingFrameLocation[testCaseId].split(':');
            while (oldFrameLevels.length > newFrameLevels.length) {
                addCommandAuto("selectFrame", [
                    ["relative=parent"]
                ], "");
                oldFrameLevels.pop();
            }
            while (oldFrameLevels.length != 0 && oldFrameLevels[oldFrameLevels.length - 1] != newFrameLevels[oldFrameLevels.length - 1]) {
                addCommandAuto("selectFrame", [
                    ["relative=parent"]
                ], "");
                oldFrameLevels.pop();
            }
            while (oldFrameLevels.length < newFrameLevels.length) {
                addCommandAuto("selectFrame", [
                    ["index=" + newFrameLevels[oldFrameLevels.length]]
                ], "");
                oldFrameLevels.push(newFrameLevels[oldFrameLevels.length]);
            }
            this.currentRecordingFrameLocation[testCaseId] = message.frameLocation;
        }

        //Record: doubleClickAt
        if (message.command == "doubleClickAt") {
            var command = getRecordsArray();
            var select = getSelectedRecord();
            var length = (select == "") ? testCase.getTestCommandCount() : select.split("-")[1] - 1;
            var equaln = getCommandName(command[length - 1]) === getCommandName(command[length - 2]);
            var equalt = getCommandTarget(command[length - 1]) === getCommandTarget(command[length - 2]);
            var equalv = getCommandValue(command[length - 1]) == getCommandValue(command[length - 2]);
            if (getCommandName(command[length - 1]) === "clickAt" && equaln && equalt && equalv) {
                deleteCommand(command[length - 1].id);
                deleteCommand(command[length - 2].id);
                if (select != "") {
                    var current = document.getElementById(command[length - 2].id)
                    current.className += ' selected';
                }
            }
        } else if (message.command.includes("Value") && typeof message.value === 'undefined') {
            sideex_log.error("Error: This element does not have property 'value'. Please change to use storeText command.");
            return;
        } else if (message.command.includes("Text") && message.value === '') {
            sideex_log.error("Error: This element does not have property 'Text'. Please change to use storeValue command.");
            return;
        } else if (message.command.includes("store")) {
            // In Google Chrome, window.prompt() must be triggered in
            // an actived tabs of front window, so we let panel window been focused
            browser.windows.update(this.selfWindowId, { focused: true })
                .then(function () {
                    // Even if window has been focused, window.prompt() still failed.
                    // Delay a little time to ensure that status has been updated
                    setTimeout(function () {
                        message.value = prompt("Enter the name of the variable");
                        if (message.insertBeforeLastCommand) {
                            addCommandBeforeLastCommand(message.command, message.target, message.value);
                        } else {
                            notification(message.command, message.target, message.value);
                            addCommandAuto(message.command, message.target, message.value);
                        }
                    }, 100);
                })
            return;
        }

        //handle choose ok/cancel confirm
        if (message.insertBeforeLastCommand) {
            addCommandBeforeLastCommand(message.command, message.target, message.value);
        } else {
            notification(message.command, message.target, message.value);
            addCommandAuto(message.command, message.target, message.value);
        }
    }

    isPrivilegedPage(url) {
        if (url.substr(0, 13) == 'moz-extension' ||
            url.substr(0, 16) == 'chrome-extension') {
            return true;
        }
        return false;
    }

    rebind() {
        this.tabsOnActivatedHandler = this.tabsOnActivatedHandler.bind(this);
        this.windowsOnFocusChangedHandler = this.windowsOnFocusChangedHandler.bind(this);
        this.tabsOnRemovedHandler = this.tabsOnRemovedHandler.bind(this);
        this.webNavigationOnCreatedNavigationTargetHandler = this.webNavigationOnCreatedNavigationTargetHandler.bind(this);
        this.addCommandMessageHandler = this.addCommandMessageHandler.bind(this);
    }

    attach() {
        if (this.attached) {
            return;
        }
        this.attached = true;
        browser.tabs.onActivated.addListener(this.tabsOnActivatedHandler);
        browser.windows.onFocusChanged.addListener(this.windowsOnFocusChangedHandler);
        browser.tabs.onRemoved.addListener(this.tabsOnRemovedHandler);
        browser.webNavigation.onCreatedNavigationTarget.addListener(this.webNavigationOnCreatedNavigationTargetHandler);
        browser.runtime.onMessage.addListener(this.addCommandMessageHandler);
    }

    detach() {
        if (!this.attached) {
            return;
        }
        this.attached = false;
        browser.tabs.onActivated.removeListener(this.tabsOnActivatedHandler);
        browser.windows.onFocusChanged.removeListener(this.windowsOnFocusChangedHandler);
        browser.tabs.onRemoved.removeListener(this.tabsOnRemovedHandler);
        browser.webNavigation.onCreatedNavigationTarget.removeListener(this.webNavigationOnCreatedNavigationTargetHandler);
        browser.runtime.onMessage.removeListener(this.addCommandMessageHandler);
    }

    setOpenedWindow(windowId) {
        this.openedWindowIds[windowId] = true;
    }

    setSelfWindowId(windowId) {
        this.selfWindowId = windowId;
    }

    getSelfWindowId() {
        return this.selfWindowId;
    }
}



export { BackgroundRecorder }
