// Command converter for Robot Framework
// This file converts between Katalon/Selenium IDE commands and Robot Framework commands

// Forward mapping: Selenium IDE -> Robot Framework (for recording and display)
function convertToRobotFrameworkCommand(command, target, value) {
    const cmd = command.toLowerCase();
    
    // Convert Katalon/Selenium IDE commands to Robot Framework commands
    switch (cmd) {
        case 'open':
            return { command: 'Go To', target: target, value: value };
        case 'click':
            return { command: 'Click Element', target: target, value: value };
        case 'clickat':
            return { command: 'Click Element', target: target, value: value };
        case 'doubleclickat':
            return { command: 'Double Click Element', target: target, value: value };
        case 'type':
            return { command: 'Input Text', target: target, value: value };
        case 'sendkeys':
            return { command: 'Press Keys', target: target, value: value };
        case 'select':
            return { command: 'Select From List By Value', target: target, value: value };
        case 'selectframe':
            return { command: 'Select Frame', target: target, value: value };
        case 'selectwindow':
            return { command: 'Select Window', target: target, value: value };
        case 'waitforelementpresent':
            return { command: 'Wait Until Element Is Visible', target: target, value: value };
        case 'waitforelementnotpresent':
            return { command: 'Wait Until Element Is Not Visible', target: target, value: value };
        case 'waitforvisible':
            return { command: 'Wait Until Element Is Visible', target: target, value: value };
        case 'waitfornotvisible':
            return { command: 'Wait Until Element Is Not Visible', target: target, value: value };
        case 'asserttext':
            return { command: 'Element Should Contain', target: target, value: value };
        case 'assertnottext':
            return { command: 'Element Should Not Contain', target: target, value: value };
        case 'assertelementpresent':
            return { command: 'Element Should Be Visible', target: target, value: value };
        case 'assertnotelementpresent':
            return { command: 'Element Should Not Be Visible', target: target, value: value };
        case 'assertvalue':
            return { command: 'Element Should Contain', target: target, value: value };
        case 'assertnotvalue':
            return { command: 'Element Should Not Contain', target: target, value: value };
        case 'asserttitle':
            return { command: 'Title Should Be', target: target, value: value };
        case 'assertnottitle':
            return { command: 'Title Should Not Be', target: target, value: value };
        case 'asserturl':
            return { command: 'Location Should Be', target: target, value: value };
        case 'assertnoturl':
            return { command: 'Location Should Not Be', target: target, value: value };
        case 'storetext':
            return { command: 'Get Text', target: target, value: value };
        case 'storevalue':
            return { command: 'Get Element Attribute', target: target, value: value };
        case 'storetitle':
            return { command: 'Get Title', target: target, value: value };
        case 'storeurl':
            return { command: 'Get Location', target: target, value: value };
        case 'mouseover':
            return { command: 'Mouse Over', target: target, value: value };
        case 'mouseout':
            return { command: 'Mouse Out', target: target, value: value };
        case 'draganddrop':
            return { command: 'Drag And Drop', target: target, value: value };
        case 'submit':
            return { command: 'Submit Form', target: target, value: value };
        case 'pause':
            return { command: 'Sleep', target: target, value: value };
        case 'echo':
            return { command: 'Log', target: target, value: value };
        case 'runscript':
            return { command: 'Execute JavaScript', target: target, value: value };
        case 'executeScript':
            return { command: 'Execute JavaScript', target: target, value: value };
        case 'check':
            return { command: 'Select Checkbox', target: target, value: value };
        case 'uncheck':
            return { command: 'Unselect Checkbox', target: target, value: value };
        case 'verifytext':
            return { command: 'Element Should Contain', target: target, value: value };
        case 'verifynottext':
            return { command: 'Element Should Not Contain', target: target, value: value };
        case 'verifyelementpresent':
            return { command: 'Element Should Be Visible', target: target, value: value };
        case 'verifynotelementpresent':
            return { command: 'Element Should Not Be Visible', target: target, value: value };
        case 'verifyvalue':
            return { command: 'Element Should Contain', target: target, value: value };
        case 'verifynotvalue':
            return { command: 'Element Should Not Contain', target: target, value: value };
        case 'verifytitle':
            return { command: 'Title Should Be', target: target, value: value };
        case 'verifynottitle':
            return { command: 'Title Should Not Be', target: target, value: value };
        case 'verifyurl':
            return { command: 'Location Should Be', target: target, value: value };
        case 'verifynoturl':
            return { command: 'Location Should Not Be', target: target, value: value };
        case 'waitforpagetoload':
            return { command: 'Wait Until Page Contains', target: target, value: value };
        case 'waitforcondition':
            return { command: 'Wait Until Condition', target: target, value: value };
        case 'chooseokonnextconfirmation':
            return { command: 'Handle Alert', target: target, value: 'ACCEPT' };
        case 'choosecancelonnextconfirmation':
            return { command: 'Handle Alert', target: target, value: 'DISMISS' };
        case 'answeronnextprompt':
            return { command: 'Input Text Into Alert', target: target, value: value };
        case 'clickandwait':
            return { command: 'Click Element And Wait', target: target, value: value };
        case 'typeandwait':
            return { command: 'Input Text And Wait', target: target, value: value };
        case 'selectandwait':
            return { command: 'Select From List And Wait', target: target, value: value };
        case 'checkforautomated':
            return { command: 'Wait Until Page Contains', target: target, value: value };
        case 'editcontent':
            return { command: 'Input Text', target: target, value: value };
        default:
            // Return original command if no conversion is available
            return { command: command, target: target, value: value };
    }
}

// Reverse mapping: Robot Framework -> Selenium IDE (for execution)
function convertToSeleniumCommand(command, target, value) {
    const cmd = command.toLowerCase();
    
    // Convert Robot Framework commands back to Selenium IDE commands for execution
    switch (cmd) {
        case 'go to':
            return { command: 'open', target: target, value: value };
        case 'click element':
            return { command: 'click', target: target, value: value };
        case 'double click element':
            return { command: 'doubleClickAt', target: target, value: value };
        case 'input text':
            return { command: 'type', target: target, value: value };
        case 'press keys':
            return { command: 'sendKeys', target: target, value: value };
        case 'select from list by value':
            return { command: 'select', target: target, value: value };
        case 'select from list by index':
            return { command: 'select', target: target, value: value };
        case 'select from list by label':
            return { command: 'select', target: target, value: value };
        case 'select frame':
            return { command: 'selectFrame', target: target, value: value };
        case 'select window':
            return { command: 'selectWindow', target: target, value: value };
        case 'wait until element is visible':
            return { command: 'waitForElementPresent', target: target, value: value };
        case 'wait until element is not visible':
            return { command: 'waitForElementNotPresent', target: target, value: value };
        case 'element should contain':
            return { command: 'assertText', target: target, value: value };
        case 'element should not contain':
            return { command: 'assertNotText', target: target, value: value };
        case 'element should be visible':
            return { command: 'assertElementPresent', target: target, value: value };
        case 'element should not be visible':
            return { command: 'assertElementNotPresent', target: target, value: value };
        case 'title should be':
            return { command: 'assertTitle', target: target, value: value };
        case 'title should not be':
            return { command: 'assertNotTitle', target: target, value: value };
        case 'location should be':
            return { command: 'assertLocation', target: target, value: value };
        case 'location should not be':
            return { command: 'assertNotLocation', target: target, value: value };
        case 'get text':
            return { command: 'storeText', target: target, value: value };
        case 'get element attribute':
            return { command: 'storeAttribute', target: target, value: value };
        case 'get title':
            return { command: 'storeTitle', target: target, value: value };
        case 'get location':
            return { command: 'storeLocation', target: target, value: value };
        case 'mouse over':
            return { command: 'mouseOver', target: target, value: value };
        case 'mouse out':
            return { command: 'mouseOut', target: target, value: value };
        case 'drag and drop':
            return { command: 'dragAndDrop', target: target, value: value };
        case 'submit form':
            return { command: 'submit', target: target, value: value };
        case 'sleep':
            return { command: 'pause', target: target, value: value };
        case 'log':
            return { command: 'echo', target: target, value: value };
        case 'execute javascript':
            return { command: 'runScript', target: target, value: value };
        case 'select checkbox':
            return { command: 'check', target: target, value: value };
        case 'unselect checkbox':
            return { command: 'uncheck', target: target, value: value };
        case 'wait until page contains':
            return { command: 'waitForPageToLoad', target: target, value: value };
        case 'wait until condition':
            return { command: 'waitForCondition', target: target, value: value };
        case 'handle alert':
            if (value === 'ACCEPT') {
                return { command: 'chooseOkOnNextConfirmation', target: target, value: value };
            } else {
                return { command: 'chooseCancelOnNextConfirmation', target: target, value: value };
            }
        case 'input text into alert':
            return { command: 'answerOnNextPrompt', target: target, value: value };
        case 'click element and wait':
            return { command: 'clickAndWait', target: target, value: value };
        case 'input text and wait':
            return { command: 'typeAndWait', target: target, value: value };
        case 'select from list and wait':
            return { command: 'selectAndWait', target: target, value: value };
        
        // Special handling for dropdowns and calendars
        case 'select date from calendar':
            return { command: 'click', target: target, value: value };
        case 'select time from dropdown':
            return { command: 'select', target: target, value: value };
        case 'select option from dropdown':
            return { command: 'select', target: target, value: value };
        case 'select multiple options from dropdown':
            return { command: 'select', target: target, value: value };
        case 'deselect all from dropdown':
            return { command: 'select', target: target, value: '' };
        case 'dropdown should contain':
            return { command: 'assertElementPresent', target: target, value: value };
        case 'dropdown should not contain':
            return { command: 'assertElementNotPresent', target: target, value: value };
        case 'dropdown should have selected':
            return { command: 'assertSelectedValue', target: target, value: value };
        case 'dropdown should not have selected':
            return { command: 'assertNotSelectedValue', target: target, value: value };
        case 'calendar should show date':
            return { command: 'assertElementPresent', target: target, value: value };
        case 'calendar should not show date':
            return { command: 'assertElementNotPresent', target: target, value: value };
        case 'calendar should show month':
            return { command: 'assertElementPresent', target: target, value: value };
        case 'calendar should not show month':
            return { command: 'assertElementNotPresent', target: target, value: value };
        case 'calendar should show year':
            return { command: 'assertElementPresent', target: target, value: value };
        case 'calendar should not show year':
            return { command: 'assertElementNotPresent', target: target, value: value };
        case 'set date':
            return { command: 'type', target: target, value: value };
        case 'set time':
            return { command: 'type', target: target, value: value };
        case 'set datetime':
            return { command: 'type', target: target, value: value };
        case 'get date':
            return { command: 'storeText', target: target, value: value };
        case 'get time':
            return { command: 'storeText', target: target, value: value };
        case 'get datetime':
            return { command: 'storeText', target: target, value: value };
        case 'date should be':
            return { command: 'assertText', target: target, value: value };
        case 'date should not be':
            return { command: 'assertNotText', target: target, value: value };
        case 'time should be':
            return { command: 'assertText', target: target, value: value };
        case 'time should not be':
            return { command: 'assertNotText', target: target, value: value };
        case 'datetime should be':
            return { command: 'assertText', target: target, value: value };
        case 'datetime should not be':
            return { command: 'assertNotText', target: target, value: value };
        
        default:
            // Return original command if no conversion is available
            return { command: command, target: target, value: value };
    }
}

// Export the functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { convertToRobotFrameworkCommand, convertToSeleniumCommand };
}
