import { deleteCommand, setBreakpoint, setSelected } from "./actions.js";
import { addCommand } from "../../view/records-grid/add-command.js";
import { getSelectedRecords } from "../../view/records-grid/selected-records.js";
import { getRecordsArray } from "../../view/records-grid/get-records-array.js";
import { getCommandName, getCommandTarget, getCommandValue } from "../../view/records-grid/record-utils.js";
import { getSelectedCase } from "../../view/testcase-grid/selected-case.js";
import { findTestCaseById } from "../data-service/test-case-service.js";

function reduceDuplicateCommand(recordState, stateAction) {
    const result = [];
    for (let i = 0; i < recordState.length; i++) {
        let duplicate = false;
        if (!recordState[i]) continue;
        for (let j = 0; j < result.length; j++) {
            if (recordState[i].id === result[j].id) {
                duplicate = true;
                break;
            }
        }
        if (!duplicate) {
            result.push(recordState[i]);
        }
    }
    if (stateAction == 'add' && result.length > 0 && result.every(e => !e.isSelected)) {
        result[result.length - 1].isSelected = true;
    }

    return result;
}

const extractInformationFromRecordGrid = (stateAction) => {
    const recordsArray = getRecordsArray();
    const recordState = [...recordsArray].map(element => extractInformationFromRecordGridElement(element));
    //we reduce duplicate in case of the use make a drag and drop action
    //that action will duplicate the current record that being drag
    let reducedCommandList = reduceDuplicateCommand(recordState, stateAction);
    return reducedCommandList;
}

function getCommandTargets(record) {
    let showTarget = record.getElementsByTagName("td")[2]?.getElementsByTagName("div")[0]?.textContent;
    if (!showTarget) {
        return [
            [""]
        ];
    }
    let targetOptions = record.getElementsByTagName("td")[2]
        .getElementsByTagName("datalist")[0]
        .getElementsByTagName("option");
    let targetElements = [];
    let tempTarget;
    let isNewShowTarget = true;
    for (let j = 0; j < targetOptions.length; j++) {
        tempTarget = targetOptions[j].text;
        if (showTarget === tempTarget) {
            targetElements.splice(0, 0, [tempTarget]);
            isNewShowTarget = false;
        } else {
            targetElements.push([tempTarget]);
        }
    }
    if (isNewShowTarget) {
        targetElements.splice(0, 0, [showTarget]);
    }
    return targetElements;
}

function extractInformationFromRecordGridElement(record) {
    //bypass drag and drop sortable
    if (record.classList.contains("ui-sortable-placeholder") || record.classList.contains("ui-sortable-helper")) {
        return;
    }
    let isBreakpoint = record.getElementsByTagName("td")[1].classList.contains('break');
    let isSelected = record.classList.contains("selectedRecord");
    let selectedTd = $(record).find('td.selectedTd').index();
    let testStep = {
        id: record.id,
        command: getCommandName(record),
        target: getCommandTargets(record),
        value: getCommandValue(record),
        isBreakpoint,
        isSelected,
        selectedTd: selectedTd
    }
    return testStep;
}

const restoreRecords = (recordState) => {
    //remove all current record
    [...getRecordsArray()].forEach(record => deleteCommand(record.id));
    //add record again from recordState
    recordState.forEach(record => {
        if (!record) {
            return;
        }
        let { command, target, value, isBreakpoint, selectedTd } = record;
        addCommand(command, target, value, 1, false);
        //check if this record is set as breakpoint
        if (isBreakpoint) {
            setBreakpoint(record.id);
        }
        if (selectedTd >= 0) {
            $("#" + record.id).find('td').eq(selectedTd).addClass('selectedTd');
        }
    });
    recordState.filter(record => record.isSelected).forEach(record => setSelected(record.id));
    // resetFocus();
}

function resetFocus() {
    let firstSelectedRecord = getSelectedRecords()[0];
    if (!firstSelectedRecord) {
        return;
    }
    firstSelectedRecord.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
    });
    const selectedTestCase = getSelectedCase();
    const testCase = findTestCaseById(selectedTestCase.id);
    const testCommandIndex = parseInt(firstSelectedRecord.id.substring(8)) - 1;
    const testCommand = testCase.commands[testCommandIndex];
    let command = testCommand.name,
        target = testCommand.defaultTarget,
        value = testCommand.value;
    $("#command-command").val(command);
    $("#command-target").val(target);
    $("#command-value").val(value);
}


const extractRecordGridWhenEditCommandToolBar = (commandToolbarID) => {
    const commandToolbarElement = $("#" + commandToolbarID);
    let recordID = commandToolbarElement.data("ID");
    let oldValue = commandToolbarElement.data("oldVal");
    let recordGridState = extractInformationFromRecordGrid();
    if (oldValue !== undefined) {
        recordGridState.map(record => {
            if (record.id === recordID) {
                record.isSelected = true;
                switch (commandToolbarID) {
                    case "command-command":
                        record.command = oldValue;
                        break;
                    case "command-value":
                        record.value = oldValue;
                        break;
                    case "command-target":
                        if (!record.target.includes(oldValue)) {
                            record.target.shift();
                        } else {
                            //move the first target to last
                            record.target.push(record.target.splice(0, 1)[0]);
                        }
                        break;
                }
                commandToolbarElement.removeData("ID");
                commandToolbarElement.removeData("oldVal");
            } else {
                record.isSelected = false;
            }
            return record;
        });
    }
    return recordGridState;
}

export { extractInformationFromRecordGrid, restoreRecords, extractRecordGridWhenEditCommandToolBar, resetFocus, extractInformationFromRecordGridElement }