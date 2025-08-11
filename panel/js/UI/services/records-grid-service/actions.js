import { executeCommand } from "../../../background/playback/service/actions/play/play-actions.js";
import { addCommandManu } from "../../view/records-grid/add-command.js"
import { getSelectedCase } from "../../view/testcase-grid/selected-case.js";
import { findTestCaseById } from "../data-service/test-case-service.js";
import { modifyCaseSuite } from "../../view/records-grid/modify-case-suite.js";
import { reAssignIdForDelete } from "../../view/records-grid/re-assign-id.js";
import { getSelectedRecord, getSelectedRecords,getSelectedEmptyRecords } from "../../view/records-grid/selected-records.js";
import { getDefaultProfile } from "../global-profile-service/profile-data-service.js";
import { ProfileVariable } from "../../models/global-profile/profile-variable.js";
import { trackingSegment } from "../tracking-service/segment-tracking-service.js";
import { getTdRealValueNode, getTdShowValueNode } from "../../view/records-grid/record-utils.js";
import { addProfileLinkForCommandValue } from "../../view/records-grid/global-profile-link-for-command-value.js";
import { addDirtyMark } from "../../view/global-profile/dirty-mark.js";
import { parseCommandValue } from "../global-profile-service/parse-command-value.js";

const deleteCommand = (selectedID) => {
    if (selectedID) {
        //UI record start with 1
        const index = parseInt(selectedID.substring(8)) - 1;
        const selectedTestCase = getSelectedCase();
        const testCaseID = selectedTestCase.id;
        const testCase = findTestCaseById(testCaseID);
        testCase.removeCommandAtIndex(index);

        modifyCaseSuite();

        let delete_node = document.getElementById(selectedID);
        // do not forget to remove textNode
        if (delete_node.previousSibling.nodeType === 3) {
            delete_node.parentNode.removeChild(delete_node.previousSibling);
        }
        delete_node.parentNode.removeChild(delete_node);

        let count = testCase.getTestCommandCount();
        document.getElementById("records-count").value = count;
        selectedID = parseInt(selectedID.split("-")[1]);

        // delete last one
        if (selectedID - 1 !== count) {
            reAssignIdForDelete(selectedID, count);
        }

    }
}

const setBreakpoint = (selectedID) => {
    if (selectedID) {
        let commandIndex = parseInt(selectedID.split("-")[1]) - 1;
        const selectedTestCase = getSelectedCase();
        const testCase = findTestCaseById(selectedTestCase.id);

        let current_node = document.getElementById(selectedID).getElementsByTagName("td")[1];
        if (!current_node.classList.contains("break")) {
            current_node.classList.add("break");
            testCase.commands[commandIndex].state = 'break';
        } else {
            current_node.classList.remove("break");
            testCase.commands[commandIndex].state = null;
        }
    }
}

const setSelected = (selectedID) => {
    if (selectedID) {
        let current_node = document.getElementById(selectedID);
        if (!current_node.classList.contains("selectedRecord")) {
            current_node.classList.add("selectedRecord");
        } else {
            current_node.classList.remove("selectedRecord");
        }
    }
}

let tempCommand = [];

const copyAction = () => {
    // clear tempCommand
    tempCommand = [];
    let ref = getSelectedRecords();
    const selectedTestCase = getSelectedCase();
    const testCase = findTestCaseById(selectedTestCase.id);
    for (let i = 0; i < ref.length; i++) {
        const testCommandIndex = parseInt(ref[i].id.substring(8)) - 1;
        const testCommand = testCase.commands[testCommandIndex];
        tempCommand[i] = {
            "command": testCommand.name,
            "test": testCommand.defaultTarget,
            "target": testCommand.targets,
            "value": testCommand.value
        };
    }
}

function selectCommands(start, end) {
    for (let i = start; i < end; i++) {
        let ID = "#records-" + i;
        $(ID).addClass("selectedRecord");
    }
}

function unselectSelectedCommands() {
    const selectedRecords = [...getSelectedRecords()];
    selectedRecords.forEach(record => {
        $(record).removeClass("selectedRecord");
    });
}

const pasteAction = () => {
    if (tempCommand.length > 0) {
        let selectedRecords = getSelectedRecords();
        if (selectedRecords.length === 0) {
            // NOTE: because there is no selected record.
            // Therefore, index i is form 0 to length-1.
            for (let i = 0; i < tempCommand.length; i++) {
                //addCommandManu receive targets as a 2D array
                const targets = tempCommand[i]["target"]
                  .filter(target => target !== tempCommand[i]["test"])
                  .map(target => [target]);
                targets.unshift([tempCommand[i]["test"]]);
                addCommandManu(tempCommand[i]["command"], targets, tempCommand[i]["value"]);
            }
            unselectSelectedCommands();
            selectCommands(1, tempCommand.length + 1)
            return;
        }

        // NOTE: because addCommandManu is add command on this below.
        // Therefore, index i is form length-1 to 0
        for (let i = tempCommand.length - 1; i >= 0; i--) {
            //addCommandManu receive targets as a 2D array
            const targets = tempCommand[i]["target"]
              .filter(target => target !== tempCommand[i]["test"])
              .map(target => [target]);
            targets.unshift([tempCommand[i]["test"]]);
            addCommandManu(tempCommand[i]["command"], targets, tempCommand[i]["value"]);
        }

        let lastSelectedID = selectedRecords[selectedRecords.length - 1].id; //format records-x
        let index = parseInt(lastSelectedID.substring(8));
        
        const selectEmptyRecords = getSelectedEmptyRecords();
        if(selectEmptyRecords.length > 0){
            const selectedTestCase = getSelectedCase();
            const testCase = findTestCaseById(selectedTestCase.id);
            for (let i = selectEmptyRecords.length - 1; i >= 0; i--) {
                let selectedRecord = selectEmptyRecords[i];
                const testCommandIndex = parseInt(selectedRecord.id.substring(8)) - 1;
                const testCommand = testCase.commands[testCommandIndex];
                makeSelfHealingOutOfDate(testCommand.defaultTarget, testCommand);
                deleteCommand(selectedRecord.id);
            }
            unselectSelectedCommands();
            selectCommands(index, index + tempCommand.length);
        }else{
            unselectSelectedCommands();
            selectCommands(index + 1, index + tempCommand.length + 1);
        }
        
    }
}

const addAction = () => {
    // target is 2-D array
    addCommandManu("", [
        [""]
    ], "");
}

const deleteAllAction = () => {
    if (window.confirm('Are you sure you want to delete all test steps?')) {
        const selectedTestCase = getSelectedCase();
        const testCase = findTestCaseById(selectedTestCase.id);
        for (const command of testCase.commands) {
            makeSelfHealingOutOfDate(command.target, command);
        }
        testCase.commands = [];
        clean_panel();
        modifyCaseSuite();
    }
}

const deleteSelectedAction = () => {
    let selectedRecords = getSelectedRecords();
    const selectedTestCase = getSelectedCase();
    const testCase = findTestCaseById(selectedTestCase.id);

    for (let i = selectedRecords.length - 1; i >= 0; i--) {
        let selectedRecord = selectedRecords[i];
        const testCommandIndex = parseInt(selectedRecord.id.substring(8)) - 1;
        const testCommand = testCase.commands[testCommandIndex];
        makeSelfHealingOutOfDate(testCommand.defaultTarget, testCommand);
        deleteCommand(selectedRecord.id);
    }
}

const selectAllAction = () => {
    let recordNode = document.getElementById("records-grid").getElementsByTagName("TR");
    for (let i = 0; i < recordNode.length; i++) {
        recordNode[i].classList.add("selectedRecord");
    }
}

const setBreakpointAction = () => {
    setBreakpoint(getSelectedRecord());
}

const playFromHereAction = (index) => {
    currentPlayingFromHereCommandIndex = parseInt(index) - 1;
    $('#playback').click();
}

const playCommandAction = (index) => {
    executeCommand(index)
}

const playToHereAction = () => {
    setBreakpoint(getSelectedRecord());
    $('#playback').click();
}

const recordFromHereAction = () => {
    $('#record').click();
}

const changeCommandTargetAction = (selectedRecords, oldValue) => {
    const selectedTestCase = getSelectedCase();
    if (selectedTestCase){
        const testCase = findTestCaseById(selectedTestCase.id);
        let index;
        if(selectedRecords){
            index = selectedRecords;
        }else{
            index = parseInt(getSelectedRecord().substring(8)) - 1;
        }
        makeSelfHealingOutOfDate(oldValue, testCase.commands[index]);
    }
}

function makeSelfHealingOutOfDate(oldValue, testCommand) {
    let selfHealingElementList = $("#selfHealingList").find("tr");
    for (let element of selfHealingElementList) {
        let approveColumn = $(element).find("td")[4];
        let brokenLocator = $(approveColumn).find("input[name='broken_locator']")[0].value;
        let proposeLocator = $(approveColumn).find("input[name='propose_locator']")[0].value;
        let optionList = testCommand.targets;
        if (brokenLocator === oldValue && optionList.includes(proposeLocator)) {
            if ($(approveColumn).find("i").length === 0) {
                let icon =
                  `<i title="This broken locator is out of date. Approving it will simply delete this row from the self-healing tab." 
                class="fa fa-exclamation-circle" aria-hidden="true"></i>`;
                $(approveColumn).append(icon);
            }
        }
    }
}

const addValueToProfileAction = async (testCommand, recordElement, profile) => {
    const commandValueVariables = parseCommandValue(testCommand);
    //if there is a variable (except Global Variable) in command value
    //we take that variable and convert it to Global Variable, the value for the new Global Variable will be empty
    //Ex: ${abc} -> ${GlobalVariable.abc}
    if (commandValueVariables?.length > 0){
        for (const variable of commandValueVariables){
            if (!(await profile.isVariableNameExist(variable))) {
                await profile.insertNewVariable(new ProfileVariable(variable, ""), profile.variables.length);
            }
            testCommand.value = testCommand.value.replace("${" + variable + "}", "${GlobalVariable." + variable + "}");
        }
    } else {
        if (!testCommand.value.includes("${GlobalVariable")){
            const variableName = testCommand.value
              .replace(/[^\w\s]/gi, '')//remove special case
              .replace(/\s+/g,' ') //remove redundant space
              .replace(/ /g,"_").toLowerCase();//join space with _
            if (!(await profile.isVariableNameExist(variableName))){
                const regex = /(store|runScript)/;
                const variableValue = regex.test(testCommand.name) ? "" : testCommand.value;
                await profile.insertNewVariable(new ProfileVariable(variableName, variableValue), profile.variables.length);
            }
            testCommand.value = "${GlobalVariable." + variableName + "}";
        }
    }
    getTdRealValueNode(recordElement, 3).textContent = testCommand.value;
    getTdShowValueNode(recordElement, 3).textContent = testCommand.value;
    await addProfileLinkForCommandValue(recordElement);
    addDirtyMark(profile.id);
    modifyCaseSuite();
}

const addValuesToDefaultProfileAction = () => {
    const records = getSelectedRecords();
    const selectedTestCase = findTestCaseById(getSelectedCase().id);
    getDefaultProfile().then(async defaultProfile => {
        let count = 0;
        for (const recordElement of records){
            const index = parseInt(recordElement.id.substring(8)) - 1;
            const testCommand = selectedTestCase.commands[index];
            if (testCommand.value !== ""){
                count++;
                await addValueToProfileAction(testCommand, recordElement, defaultProfile)
            }
        }
        trackingSegment("kru_add_global_variables_from_test_case",
          { num_global_variables: count});
    });

}

export {
    copyAction,
    pasteAction,
    addAction,
    deleteAllAction,
    deleteSelectedAction,
    setBreakpointAction,
    playFromHereAction,
    playCommandAction,
    playToHereAction,
    selectAllAction,
    deleteCommand,
    setBreakpoint,
    setSelected,
    changeCommandTargetAction,
    addValuesToDefaultProfileAction,
    addValueToProfileAction,
    recordFromHereAction
};