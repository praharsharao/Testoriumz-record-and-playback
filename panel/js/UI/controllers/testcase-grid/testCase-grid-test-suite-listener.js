import { getSelectedSuite, setSelectedSuite } from "../../view/testcase-grid/selected-suite.js";
import { downloadSuite } from "../../services/html-service/download-suite.js";
import {
    deleteTestSuite,
    findTestSuiteById, findTestSuiteIndexByID,
    getTestSuiteCount,
    insertNewTestSuiteAtIndex,
    getAllTestSuites,
    getAllDynamicTestSuites
} from "../../services/data-service/test-suite-service.js";
import { displayConfirmCloseDialog } from "../../view/testcase-grid/display-confirm-close-suite-dialog.js";
import { renderNewTestSuite } from "../../view/testcase-grid/render-new-test-suite.js";
// import { checkLoginOrSignupUserForCreateTestCase } from "../../../../../content-marketing/panel/login-inapp.js";
import { disableButton } from "../../view/buttons.js";
import { saveData } from "../../services/data-service/save-data.js";
import { testSuitContainerOpen, testSuiteContainerClose } from "../../view/testcase-grid/test-suite-container.js";
import { TestSuite } from "../../models/test-model/test-suite.js";

function removeTestSuite(suiteContainerElement) {
    suiteContainerElement.parentElement.removeChild(suiteContainerElement);
    clean_panel();
    saveData();
    const testSuiteID = suiteContainerElement.id;
    deleteTestSuite(testSuiteID);
    //disable play button if there are no test suites left
    if (getTestSuiteCount() === 0) {
        disableButton("playback");
        disableButton("playSuite");
        disableButton("playSuites");
    }
}


async function closeTestSuite(suiteContainerElement) {
    const testSuiteID = suiteContainerElement.id;
    setSelectedSuite(testSuiteID);
    const testSuite = findTestSuiteById(testSuiteID);
    const html = `<div style="color:red;">This action will remove your test suite and changes made to your test suite permanently, 
                you can open it again only if a copy is available on your computer.</div>
        </br>
        <div>Save the ${testSuite.name} test suite to your computer?"</div>`;
    let userAnswer = await displayConfirmCloseDialog(html);
    if (userAnswer === "true") {
        downloadSuite(suiteContainerElement, function() {
            removeTestSuite(suiteContainerElement);
        })
    } else {
        removeTestSuite(suiteContainerElement);
    }
}

$(document).ready(function() {
    $("#testSuiteDropdown").click(function () {
        const image = $(this).find("img");
        const src = $(image).attr("src");
        if (src.includes("off")) {
            testSuitContainerOpen()
        } else {
            testSuiteContainerClose();
        }
    });

    $("#save-testSuite").click(function(event) {
        event.stopPropagation();
        const s_suite = getSelectedSuite();
        downloadSuite(s_suite);
    });

    $("#close-testSuite").click(async function() {
        const testSuiteContainerElement = getSelectedSuite();
        await closeTestSuite(testSuiteContainerElement);
    });

    $("#close-all-testSuites").click(async function(event) {
        const s_suite = getSelectedSuite();
        const testSuite = findTestSuiteById(s_suite.id);
        if (testSuite.status === 'dynamic') {
            while (getAllDynamicTestSuites().length > 0) {
                const testSuite = getAllDynamicTestSuites()[0];
                const testSuiteContainerElement = $(`#${testSuite.id}`)[0];
                await closeTestSuite(testSuiteContainerElement);
            }
        } else {
            while (getAllTestSuites().length > 0) {
                const testSuite = getAllTestSuites()[0];
                const testSuiteContainerElement = $(`#${testSuite.id}`)[0];
                await closeTestSuite(testSuiteContainerElement);
            }
        }
        // while (getTestSuiteCount() !== 0) {
        //     const testSuite = getTextSuiteByIndex(0);
        //     const testSuiteContainerElement = $(`#${testSuite.id}`)[0];
        //     await closeTestSuite(testSuiteContainerElement);
        // }
    });

    $("#add-testSuite").click(async function(event) {
        event.stopPropagation();
        const title = prompt("Please enter the Test Suite's name", "Untitled Test Suite");
        if (title) {
            /*** Comment out for KR-522 ***/
            // make sure user login and sign up after threshold before making new test case
            // if (!(await checkLoginOrSignupUserForCreateTestCase())) {
            //     return;
            // }
            /*** Comment out for KR-522 ***/

            // find corrected index to insert test suite
            let index = getTestSuiteCount();
            const selectedTestSuiteElement = getSelectedSuite();
            if (selectedTestSuiteElement){
                index = findTestSuiteIndexByID(selectedTestSuiteElement.id) + 1;
            }
            //insert new test suite
            const testSuite = new TestSuite(title);
            insertNewTestSuiteAtIndex(index, testSuite);
            renderNewTestSuite(title, testSuite.id);
        }
    })

    $("#add-testSuite-menu").click(function(event) {
        event.stopPropagation();
        document.getElementById('add-testSuite').click();
    });

    $("#suite-plus").click(function(event) {
        event.stopPropagation();
        document.getElementById("add-testSuite").click();
        testSuitContainerOpen();
    });

    $("#suite-open").click(function(event){
        const dropdown = $("#suite-open-dropdown");
        if ($(dropdown).css("display") === "block"){
            $(dropdown).css("display", "none");
            $("#suite-open").css("background-color", "");
            $("#suite-open").css("color", "");
            $("#suite-open img").attr("src","icons/open-test-suite.svg");
        } else {
            $(dropdown).css("display", "block");
            $("#suite-open").css("background-color", "#276EF1");
            $("#suite-open").css("color", "#FFFFFF");
            $("#suite-open img").attr("src","icons/inverted-open-test-suite.svg");
        }
    });

    $("#suite-open-recorder").click(function(event){
        event.stopPropagation();
        document.getElementById("load-testSuite-hidden").click();
        testSuitContainerOpen();
        $("#suite-open-dropdown").css("display", "none");
    });

});

export { testSuitContainerOpen }