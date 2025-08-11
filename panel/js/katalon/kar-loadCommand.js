// Robot Framework Command Loading System for Testoriumz Recorder
// This file loads Robot Framework SeleniumLibrary keywords instead of Selenium IDE commands

// Load all Robot Framework commands
function _loadSeleniumCommands() {
    // Return Robot Framework commands if available, otherwise fallback to basic commands
    if (window.robotFrameworkCommands && Array.isArray(window.robotFrameworkCommands)) {
        return window.robotFrameworkCommands;
    }
    
    // Fallback to basic Robot Framework commands if the main array isn't loaded
    var commands = [
        'Go To',
        'Click Element',
        'Click Link',
        'Input Text',
        'Input Password',
        'Select From List By Label',
        'Submit Form',
        'Wait Until Element Is Visible',
        'Wait Until Page Contains',
        'Page Should Contain',
        'Capture Page Screenshot',
        'Sleep',
        'Switch Window',
        'Switch Frame',
        'Double Click Element',
        'Mouse Over',
        'Drag And Drop',
        'Press Keys',
        'Clear Element Text',
        'Focus',
        'Scroll Element Into View'
    ];
    
    return commands;
}

// Create command mapping for Robot Framework commands to Selenium commands
function createRobotFrameworkCommandMapping() {
    if (typeof window.robotFrameworkCommands === 'undefined') {
        window.robotFrameworkCommands = {};
    }
    
    // Map Robot Framework commands to Selenium commands for execution
    window.robotFrameworkCommands['Go To'] = 'open';
    window.robotFrameworkCommands['Click Element'] = 'click';
    window.robotFrameworkCommands['Click Link'] = 'click';
    window.robotFrameworkCommands['Input Text'] = 'type';
    window.robotFrameworkCommands['Input Password'] = 'type';
    window.robotFrameworkCommands['Select From List By Label'] = 'select';
    window.robotFrameworkCommands['Select From List By Value'] = 'select';
    window.robotFrameworkCommands['Select From List By Index'] = 'select';
    window.robotFrameworkCommands['Submit Form'] = 'submit';
    window.robotFrameworkCommands['Wait Until Element Is Visible'] = 'waitForElementPresent';
    window.robotFrameworkCommands['Wait Until Element Is Clickable'] = 'waitForElementPresent';
    window.robotFrameworkCommands['Wait Until Page Contains'] = 'waitForText';
    window.robotFrameworkCommands['Wait Until Page Contains Element'] = 'waitForElementPresent';
    window.robotFrameworkCommands['Page Should Contain'] = 'assertText';
    window.robotFrameworkCommands['Page Should Not Contain'] = 'assertNotText';
    window.robotFrameworkCommands['Element Should Be Visible'] = 'assertElementPresent';
    window.robotFrameworkCommands['Element Should Not Be Visible'] = 'assertElementNotPresent';
    window.robotFrameworkCommands['Element Should Be Enabled'] = 'assertElementPresent';
    window.robotFrameworkCommands['Element Should Be Disabled'] = 'assertElementPresent';
    window.robotFrameworkCommands['Get Title'] = 'storeTitle';
    window.robotFrameworkCommands['Get Text'] = 'storeText';
    window.robotFrameworkCommands['Get Value'] = 'storeValue';
    window.robotFrameworkCommands['Capture Page Screenshot'] = 'captureEntirePageScreenshot';
    window.robotFrameworkCommands['Sleep'] = 'pause';
    window.robotFrameworkCommands['Go Back'] = 'goBack';
    window.robotFrameworkCommands['Reload Page'] = 'refresh';
    window.robotFrameworkCommands['Switch Window'] = 'selectWindow';
    window.robotFrameworkCommands['Switch Frame'] = 'selectFrame';
    window.robotFrameworkCommands['Double Click Element'] = 'doubleClick';
    window.robotFrameworkCommands['Mouse Over'] = 'mouseOver';
    window.robotFrameworkCommands['Drag And Drop'] = 'dragAndDropToObject';
    window.robotFrameworkCommands['Press Keys'] = 'sendKeys';
    window.robotFrameworkCommands['Clear Element Text'] = 'clear';
    window.robotFrameworkCommands['Focus'] = 'focus';
    window.robotFrameworkCommands['Scroll Element Into View'] = 'scrollIntoView';
    
    // Additional mappings
    window.robotFrameworkCommands['Wait Until Location Contains'] = 'waitForLocation';
    window.robotFrameworkCommands['Wait Until Location Is'] = 'waitForLocation';
    window.robotFrameworkCommands['Location Should Be'] = 'assertLocation';
    window.robotFrameworkCommands['Location Should Contain'] = 'assertLocation';
    window.robotFrameworkCommands['Title Should Be'] = 'assertTitle';
    window.robotFrameworkCommands['Title Should Contain'] = 'assertTitle';
    window.robotFrameworkCommands['Element Should Contain'] = 'assertText';
    window.robotFrameworkCommands['Element Should Not Contain'] = 'assertNotText';
    window.robotFrameworkCommands['Element Should Be Equal'] = 'assertText';
    window.robotFrameworkCommands['Element Should Not Be Equal'] = 'assertNotText';
    window.robotFrameworkCommands['Checkbox Should Be Selected'] = 'assertChecked';
    window.robotFrameworkCommands['Checkbox Should Not Be Selected'] = 'assertNotChecked';
    window.robotFrameworkCommands['Radio Button Should Be Set To'] = 'assertChecked';
    window.robotFrameworkCommands['List Selection Should Be'] = 'assertSelectedLabel';
    window.robotFrameworkCommands['List Should Have No Selections'] = 'assertNotSelectedLabel';
    window.robotFrameworkCommands['Table Should Contain'] = 'assertText';
    window.robotFrameworkCommands['Table Header Should Contain'] = 'assertText';
    window.robotFrameworkCommands['Table Row Should Contain'] = 'assertText';
    window.robotFrameworkCommands['Table Column Should Contain'] = 'assertText';
    window.robotFrameworkCommands['Cookie Should Exist'] = 'assertCookie';
    window.robotFrameworkCommands['Cookie Should Not Exist'] = 'assertNotCookie';
    window.robotFrameworkCommands['Cookie Value Should Be'] = 'assertCookie';
    window.robotFrameworkCommands['Delete All Cookies'] = 'deleteAllVisibleCookies';
    window.robotFrameworkCommands['Handle Alert'] = 'chooseOkOnNextConfirmation';
    window.robotFrameworkCommands['Alert Should Be Present'] = 'assertAlert';
    window.robotFrameworkCommands['Choose File'] = 'attachFile';
    window.robotFrameworkCommands['Choose Cancel On Next Confirmation'] = 'chooseCancelOnNextConfirmation';
    window.robotFrameworkCommands['Choose Ok On Next Confirmation'] = 'chooseOkOnNextConfirmation';
    window.robotFrameworkCommands['Confirm Action'] = 'chooseOkOnNextConfirmation';
    window.robotFrameworkCommands['Dismiss Action'] = 'chooseCancelOnNextConfirmation';
}

// Initialize the command mapping when the script loads
createRobotFrameworkCommandMapping();

// Debug: Log the loaded commands and mapping
console.log("Robot Framework commands loaded:", Object.keys(window.robotFrameworkCommands || {}));
console.log("Total commands available:", _loadSeleniumCommands().length);

// Load Selenium IDE command reference (for compatibility)
$(function() {
    $.ajax({
        url: 'js/katalon/selenium-ide/iedoc-core.xml',
        success: function (document) {
            Command.apiDocuments = new Array(document);
        },
        async: false,
        dataType: 'xml'
    });
});

// Function to scrape command documentation (kept for compatibility)
function scrape(word) {
    // Implementation for command documentation scraping
    // This is kept for compatibility with existing code
}
