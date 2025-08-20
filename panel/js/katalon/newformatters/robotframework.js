$(document).ready(function(){
  newFormatters.robotframework = function(name, commands) {
    window.unsupportedCommands = [
      "ajaxWait",
      "ajaxWaitAndWait", 
      "break",
      "chooseCancelOnNextPrompt",
      "chooseCancelOnNextPromptAndWait",
      "domWait",
      "domWaitAndWait",
      "editContent",
      "editContentAndWait",
      "pageWait",
      "pageWaitAndWait",
      "prePageWait",
      "prePageWaitAndWait",
      "showElement",
      "showElementAndWait",
      "waitPreparation",
      "waitPreparationAndWait",
      "gotoIf",
      "gotoLabel",
      "label",
      "writeToCSV",
      "appendToCSV",
      "appendToJSON",
      "storeCsv",
      "endLoadVars",
      "loadVars",
      "addSelection",
      "captureEntirePageScreenshot",
      "getEval",
      "runScript",
      "if",
      "else",
      "endIf",
      "elseIf",
      "while",
      "endWhile",
      "selectWindow",
      "storeEval"
    ];

    const robotFramework = function(name) {
      const formatter = function(commands) {
        let content = '';
        
        // Settings section
        content += '*** Settings ***\n';
        content += 'Library    SeleniumLibrary\n';
        content += 'Library    DateTime\n';
        content += 'Library    OperatingSystem\n';
        content += 'Library    String\n';
        content += 'Library    Collections\n';
        content += 'Library    BuiltIn\n';
        content += 'Variables    ../Variables/Variables.py\n';
        content += 'Resource    ../Resources/keywords1.robot\n';
        content += 'Library    ../Resources/console.py\n';
        content += 'Library    ../Variables/XpathLibrary.py\n';
        content += '\n';
        
        // Variables section
        content += '*** Variables ***\n';
        content += '${BROWSER}    chrome\n';
        content += '${SELSPEED}    0.0s\n';
        content += '${TIMEOUT}     10s\n';
        content += '${SCREENSHOT_DIR}    ${CURDIR}${/}screenshots\n';
        content += '${KEY_DOWN}    \\ue015\n';
        content += '${KEY_ENTER}    \\ue007\n';
        content += '${data_file}    ${CURDIR}${/}data.json\n';
        
        // Add specific variables for OrangeHRM elements
        if (commands.some(cmd => cmd.target && cmd.target.includes && cmd.target.includes('oxd-select-text'))) {
          content += '# OrangeHRM specific locators\n';
          content += '${leave}    //span[text()="Leave"]\n';
          content += '${reports_button}    //a[contains(@href, "/leave/viewLeaveBalanceReport")]\n';
          content += '${entitlements_usage_page}    //a[contains(@href, "/leave/viewLeaveEntitlements")]\n';
          content += '${my_leave}    //h6[text()="My Leave Entitlements"]\n';
          content += '${employee_name1}    //input[@placeholder="Type for hints..."]\n';
          content += '${employee_name_ad}    Admin\n';
          content += '${leave_period1}    //div[contains(@class, "oxd-select-text")][1]\n';
          content += '${generate}    //button[@type="submit"]\n';
          content += '${toggle_button}    //span[contains(@class, "oxd-switch-input")]\n';
          content += '${toggled_state_element}    //span[contains(@class, "oxd-switch-input--active")]\n';
        }
        
        // Extract element locators from commands - only for unique elements
        const elementLocators = new Map();
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          
          // Get the basic Robot Framework command
          let robotCommand = convertToRobotFramework(command);
          
          if (robotCommand) {
            const cmdParts = robotCommand.split('    ');
            const cmdName = cmdParts[0];
            const cmdTarget = cmdParts.length > 1 ? cmdParts[1] : '';
            
            // Only process interaction commands
            if ((cmdName === 'Click Element' || cmdName === 'Input Text' || 
                cmdName === 'Select From List By Label' || cmdName === 'Wait Until Element Is Visible') &&
                !elementLocators.has(cmdTarget)) {
              
              // Extract meaningful name from target
              let elementName = '';
              if (cmdTarget.includes('button') || cmdTarget.endsWith('btn')) {
                elementName = cmdTarget.match(/[^\/]*button[^\/]*|[^\/]*btn[^\/]*/i);
                if (elementName) elementName = elementName[0].replace(/[^a-zA-Z0-9]/g, '_') + '_button';
              } else if (cmdTarget.includes('input') || cmdTarget.includes('text')) {
                elementName = cmdTarget.match(/[^\/]*input[^\/]*|[^\/]*text[^\/]*/i);
                if (elementName) elementName = elementName[0].replace(/[^a-zA-Z0-9]/g, '_') + '_field';
              } else if (cmdTarget.includes('select') || cmdTarget.includes('dropdown')) {
                elementName = cmdTarget.match(/[^\/]*select[^\/]*|[^\/]*dropdown[^\/]*/i);
                if (elementName) elementName = elementName[0].replace(/[^a-zA-Z0-9]/g, '_') + '_dropdown';
              } else {
                // Generic element name based on position in the test
                elementName = `element_${i + 1}`;
              }
              
              // Make the name lowercase for Robot Framework variable convention
              elementName = elementName.toLowerCase();
              
              // Add to map if not already present
              elementLocators.set(cmdTarget, elementName);
            }
          }
        }
        
        // Add all extracted element locators
        elementLocators.forEach((name, locator) => {
          content += `\${${name}}    ${locator}\n`;
        });
        
        content += '\n';
        
        // Test Cases section
        content += '*** Test Cases ***\n';
        content += '# Function Name:    leave entitlements and report usage\n';
        content += '# Purpose:          Iterates over the values from \'Input_Value\' in report.json to run login, console data entry, and input field actions.\n';
        content += '# Input:            JSON file (report.json) containing a list under the "Input_Value" key.\n';
        content += '# Output:           Executes keywords for each item, useful for testing multiple input scenarios.\n';
        content += 'leave entitlements and report usage\n';
        content += '    ${json_data}=    Load Json From File    report.json\n';
        content += '    FOR    ${i}    IN RANGE    ${json_data["Input_Value"]}\n';
        content += '        Open_and_login\n';
        content += '        Data From Console\n';
        content += '        Input Fields\n';
        content += '    END\n';
        content += '\n';
        
        // Keywords section
        content += '*** Keywords ***\n';
        
        // Open_and_login keyword
        content += '# Function Name:    Open_and_login\n';
        content += '# Purpose:          Opens the browser and performs login actions\n';
        content += '# Input:            Browser settings and login credentials\n';
        content += '# Output:           Logged in session ready for testing\n';
        content += 'Open_and_login\n';
        content += '    ${dir_created}=    Run Keyword And Return Status    Create Directory    ${CURDIR}${/}screenshots\n';
        content += '    IF    not ${dir_created}\n';
        content += '        Log To Console    Failed to create screenshots directory\n';
        content += '    ELSE\n';
        content += '        Log To Console    Screenshots directory created\n';
        content += '    END\n';
        content += '    Open Browser    about:blank    ${BROWSER}\n';
        content += '    Set Selenium Speed    ${SELSPEED}\n';
        content += '    Set Selenium Timeout    ${TIMEOUT}\n';
        content += '\n';
        
        // Data From Console keyword
        content += '# Function Name:    data from console\n';
        content += '# Purpose:          Navigates through the Leave > Reports > Entitlements Usage page and verifies the visibility of the \'My Leave\' element.\n';
        content += '# Input:            UI locators for Leave button, Reports button, Entitlements Usage page, and My Leave element.\n';
        content += '# Output:           Logs and screenshots indicating success or failure of each interaction, with conditional flow handling.\n';
        content += 'Data From Console\n';
        
        // Process commands for Data From Console
        let dataFromConsoleContent = '';
        let inputFieldsContent = '';
        
        // Process each command - simplified version
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          
          // Get the basic Robot Framework command
          let robotCommand = convertToRobotFramework(command);
          
          // Handle unsupported commands - try to convert them to supported commands
          if (!robotCommand || robotCommand.startsWith('# Unsupported command:')) {
            // Try to handle common unsupported commands
            if (command.command.toLowerCase() === 'open') {
              robotCommand = `Go To    \${BASE_URL}`;
            } else if (command.command.toLowerCase() === 'go to') {
              robotCommand = `Go To    ${command.target}`;
            } else if (command.command.toLowerCase() === 'click element') {
              robotCommand = `Click Element    ${command.target}`;
            } else if (robotCommand.startsWith('# Unsupported command: click element')) {
              // Extract the XPath from the unsupported command
              const xpathMatch = robotCommand.match(/# Unsupported command: click element\s+([^\s]+)/);
              if (xpathMatch && xpathMatch[1]) {
                robotCommand = `Click Element    ${xpathMatch[1]}`;
              }
            } else if (robotCommand.includes('oxd-select-text') || robotCommand.includes('Chief Executive Officer')) {
              // Special handling for the specific dropdown elements in the example
              if (robotCommand.includes('Chief Executive Officer')) {
                // This is selecting an option from the dropdown
                robotCommand = `Click Element    \${CEO_OPTION}`;
              } else {
                // This is clicking on the dropdown to open it
                robotCommand = `Click Element    \${DROPDOWN_SELECTOR}`;
              }
            }
            
            // If still unsupported, add as comment and continue
            if (!robotCommand || robotCommand.startsWith('# Unsupported command:')) {
              dataFromConsoleContent += '    ' + robotCommand + '\n';
              continue;
            }
          }
          
          // Replace locators with variables
          const cmdParts = robotCommand.split('    ');
          const cmdName = cmdParts[0];
          const cmdTarget = cmdParts.length > 1 ? cmdParts[1] : '';
          const cmdValue = cmdParts.length > 2 ? cmdParts[2] : '';
          
          // Find if we have a variable for this target
          let variableTarget = cmdTarget;
          elementLocators.forEach((name, locator) => {
            if (locator === cmdTarget) {
              variableTarget = `\${${name}}`;
            }
          });
          
          // Reconstruct the command with the variable
          let updatedCommand = cmdName;
          if (variableTarget) {
            updatedCommand += `    ${variableTarget}`;
            if (cmdValue) {
              updatedCommand += `    ${cmdValue}`;
            }
          } else {
            updatedCommand = robotCommand;
          }
          
          // Generate a unique step name based on the command
          const stepName = `${cmdName}_${i+1}`.replace(/\s+/g, '_');
          
          // Determine which keyword to add the command to (simplified)
          let currentContent = i < Math.floor(commands.length / 2) ? dataFromConsoleContent : inputFieldsContent;
          
          // Add optimized command based on type
          if (cmdName === 'Wait Until Element Is Visible') {
            currentContent += `    ${updatedCommand}\n`;
          } else if (cmdName === 'Click Element') {
            // Simplified click with validation
            currentContent += `    \${${cmdName.toLowerCase()}_clicked}=    Run Keyword And Return Status    ${updatedCommand}\n`;
            currentContent += `    IF    \${${cmdName.toLowerCase()}_clicked}\n`;
            currentContent += `        Log To Console    ${cmdName} clicked successfully\n`;
            currentContent += `        Capture Screenshot With Timestamp    ${stepName}_Success\n`;
            currentContent += `    ELSE\n`;
            currentContent += `        Log To Console    Failed to ${cmdName.toLowerCase()}\n`;
            currentContent += `        Capture Screenshot With Timestamp    ${stepName}_Failed\n`;
            currentContent += `    END\n\n`;
          } else if (cmdName === 'Input Text') {
            // Input text with key press actions
            currentContent += `    \${input_successful}=    Run Keyword And Return Status    ${updatedCommand}\n`;
            currentContent += `    IF    not \${input_successful}\n`;
            currentContent += `        Capture Screenshot With Timestamp    Input_Text_Failed\n`;
            currentContent += `        Log To Console    Failed to input text\n`;
            currentContent += `    ELSE\n`;
            currentContent += `        Capture Screenshot With Timestamp    Input_Text_Success\n`;
            currentContent += `        Log To Console    Text input successful\n`;
            currentContent += `    END\n`;
            
            // Add key press actions - simplified
            currentContent += `    \${key_enter_success}=    Run Keyword And Return Status    Press Keys    ${variableTarget}    \${KEY_ENTER}\n`;
            currentContent += `    IF    not \${key_enter_success}\n`;
            currentContent += `        Capture Screenshot With Timestamp    Key_Enter_Failed\n`;
            currentContent += `        Log To Console    Failed to press KEY_ENTER\n`;
            currentContent += `    ELSE\n`;
            currentContent += `        Capture Screenshot With Timestamp    Key_Enter_Success\n`;
            currentContent += `        Log To Console    KEY_ENTER pressed successfully\n`;
            currentContent += `    END\n\n`;
          } else if (cmdName === 'Select From List By Label') {
            // Simplified select
            currentContent += `    \${select_successful}=    Run Keyword And Return Status    ${updatedCommand}\n`;
            currentContent += `    IF    not \${select_successful}\n`;
            currentContent += `        Capture Screenshot With Timestamp    Select_Failed\n`;
            currentContent += `        Log To Console    Failed to select option\n`;
            currentContent += `    ELSE\n`;
            currentContent += `        Capture Screenshot With Timestamp    Select_Success\n`;
            currentContent += `        Log To Console    Option selected successfully\n`;
            currentContent += `    END\n\n`;
          }
          
          // Update the appropriate content
          if (i < Math.floor(commands.length / 2)) {
            dataFromConsoleContent = currentContent;
          } else {
            inputFieldsContent = currentContent;
          }
        }
        
        // Add Data From Console content
        content += dataFromConsoleContent;
        
        // Input Fields keyword
        content += '# Section:           Input Fields Interaction\n';
        content += '# Purpose:           Inputs employee name into the designated field and simulates dropdown selection using keyboard keys.\n';
        content += '# Input:             employee_name1 field locator, employee_name_ad value, and keyboard key constants (KEY_DOWN, KEY_ENTER).\n';
        content += '# Output:            Logs and screenshots indicating success or failure for each action (input text, key navigation, and selection).\n';
        content += 'Input Fields\n';
        content += '    ${data}=    Load Json From File    ${data_file}\n';
        content += '    Load And Prepare Xpaths    xpaths.json    report.json\n\n';
        content += inputFieldsContent;
        
        // Teardown Browser keyword
        content += 'Teardown Browser\n';
        content += '    Close All Browsers\n';
        content += '\n';
        
        // Add a screenshot capture keyword - simplified
        content += 'Capture Screenshot With Timestamp\n';
        content += '    [Arguments]    ${name}\n';
        content += '    ${timestamp}=    Get Current Date    result_format=%Y%m%d-%H%M%S\n';
        content += '    Capture Page Screenshot    ${CURDIR}${/}screenshots${/}${name}_${timestamp}.png\n';
        content += '\n';
        
        // Wait Until Element Is Enabled keyword
        content += 'Wait Until Element Is Enabled\n';
        content += '    [Arguments]    ${element}    ${timeout}=${TIMEOUT}\n';
        content += '    Wait Until Element Is Visible    ${element}    ${timeout}\n';
        content += '    ${is_enabled}=    Run Keyword And Return Status    Element Should Be Enabled    ${element}\n';
        content += '    Run Keyword Unless    ${is_enabled}    Wait Until Keyword Succeeds    ${timeout}    1s    Element Should Be Enabled    ${element}\n';
        content += '\n';
        
        content += 'Log Step\n';
        content += '    [Arguments]    ${step_name}    ${details}=${EMPTY}\n';
        content += '    Log    Executing: ${step_name} ${details}    console=True\n';
        content += '    ${timestamp}=    Get Current Date    result_format=%Y%m%d-%H%M%S\n';
        content += '    Capture Page Screenshot    ${SCREENSHOT_DIR}${/}${step_name}_${timestamp}.png\n';
        content += '\n';
        
        content += 'Verify Element\n';
        content += '    [Arguments]    ${element}    ${timeout}=${TIMEOUT}\n';
        content += '    Wait Until Element Is Visible    ${element}    ${timeout}\n';
        content += '    Element Should Be Visible    ${element}\n';
        content += '    Element Should Be Enabled    ${element}\n';
        content += '\n';
        
        content += 'Select Dropdown Option\n';
        content += '    [Arguments]    ${dropdown_locator}    ${option_text}\n';
        content += '    Wait Until Element Is Visible    ${dropdown_locator}\n';
        content += '    Click Element    ${dropdown_locator}\n';
        content += '    Wait Until Element Is Visible    //div[contains(@class, "oxd-select-dropdown")]//span[text()="${option_text}"]\n';
        content += '    Click Element    //div[contains(@class, "oxd-select-dropdown")]//span[text()="${option_text}"]\n';
        content += '    Wait Until Element Is Not Visible    //div[contains(@class, "oxd-select-dropdown")]\n';
        content += '\n';
        
        content += 'Handle Error\n';
        content += '    [Arguments]    ${error_message}\n';
        content += '    Log    ERROR: ${error_message}    level=ERROR    console=True\n';
        content += '    ${timestamp}=    Get Current Date    result_format=%Y%m%d-%H%M%S\n';
        content += '    Capture Page Screenshot    ${SCREENSHOT_DIR}${/}error_${timestamp}.png\n';
        content += '    Fail    ${error_message}\n';
        content += '\n';
        
        return content;
      };

      // Convert Selenium commands to Robot Framework commands
      const convertToRobotFramework = function(command) {
        const cmd = command.command.toLowerCase();
        const target = command.target || '';
        const value = command.value || '';
        
        // Navigation commands
        if (cmd === 'open') {
          return `Go To    ${target}`;
        }
        if (cmd === 'refresh') {
          return 'Reload Page';
        }
        if (cmd === 'goback') {
          return 'Go Back';
        }
        if (cmd === 'gobackandwait') {
          return 'Go Back';
        }
        
        // Element interaction commands
        if (cmd === 'click') {
          return `Click Element    ${target}`;
        }
        if (cmd === 'clickandwait') {
          return `Click Element    ${target}`;
        }
        if (cmd === 'doubleclick') {
          return `Double Click Element    ${target}`;
        }
        if (cmd === 'doubleclickandwait') {
          return `Double Click Element    ${target}`;
        }
        if (cmd === 'type') {
          return `Input Text    ${target}    ${value}`;
        }
        if (cmd === 'typeandwait') {
          return `Input Text    ${target}    ${value}`;
        }
        if (cmd === 'sendkeys') {
          return `Press Keys    ${target}    ${value}`;
        }
        if (cmd === 'sendkeysandwait') {
          return `Press Keys    ${target}    ${value}`;
        }
        if (cmd === 'submit') {
          return `Submit Form    ${target}`;
        }
        if (cmd === 'submitandwait') {
          return `Submit Form    ${target}`;
        }
        if (cmd === 'clear') {
          return `Clear Element Text    ${target}`;
        }
        if (cmd === 'clearandwait') {
          return `Clear Element Text    ${target}`;
        }
        
        // Selection commands
        if (cmd === 'select') {
          return `Select From List By Label    ${target}    ${value}`;
        }
        if (cmd === 'selectandwait') {
          return `Select From List By Label    ${target}    ${value}`;
        }
        if (cmd === 'addselection') {
          return `Select From List By Label    ${target}    ${value}`;
        }
        if (cmd === 'addselectionandwait') {
          return `Select From List By Label    ${target}    ${value}`;
        }
        if (cmd === 'removeselection') {
          return `Unselect From List By Label    ${target}    ${value}`;
        }
        if (cmd === 'removeselectionandwait') {
          return `Unselect From List By Label    ${target}    ${value}`;
        }
        
        // Mouse actions
        if (cmd === 'mouseover') {
          return `Mouse Over    ${target}`;
        }
        if (cmd === 'mouseoverandwait') {
          return `Mouse Over    ${target}`;
        }
        if (cmd === 'mousedown') {
          return `Mouse Down    ${target}`;
        }
        if (cmd === 'mousedownandwait') {
          return `Mouse Down    ${target}`;
        }
        if (cmd === 'mouseup') {
          return `Mouse Up    ${target}`;
        }
        if (cmd === 'mouseupandwait') {
          return `Mouse Up    ${target}`;
        }
        if (cmd === 'mousemove') {
          return `Mouse Move    ${target}`;
        }
        if (cmd === 'mousemoveandwait') {
          return `Mouse Move    ${target}`;
        }
        if (cmd === 'draganddrop') {
          const parts = value.split(',');
          if (parts.length >= 2) {
            return `Drag And Drop    ${target}    ${parts[0].trim()}`;
          }
          return `Drag And Drop    ${target}    ${value}`;
        }
        if (cmd === 'draganddropandwait') {
          const parts = value.split(',');
          if (parts.length >= 2) {
            return `Drag And Drop    ${target}    ${parts[0].trim()}`;
          }
          return `Drag And Drop    ${target}    ${value}`;
        }
        
        // Window and frame commands
        if (cmd === 'selectwindow') {
          return `Select Window    ${target}`;
        }
        if (cmd === 'selectframe') {
          return `Select Frame    ${target}`;
        }
        if (cmd === 'selectframeandwait') {
          return `Select Frame    ${target}`;
        }
        if (cmd === 'unselectframe') {
          return 'Unselect Frame';
        }
        if (cmd === 'unselectframeandwait') {
          return 'Unselect Frame';
        }
        
        // Alert handling
        if (cmd === 'choosecancelonnextconfirmation') {
          return 'Handle Future Dialogs    action=DISMISS';
        }
        if (cmd === 'choosecancelonnextconfirmationandwait') {
          return 'Handle Future Dialogs    action=DISMISS';
        }
        if (cmd === 'chooseokonnextconfirmation') {
          return 'Handle Future Dialogs    action=ACCEPT';
        }
        if (cmd === 'chooseokonnextconfirmationandwait') {
          return 'Handle Future Dialogs    action=ACCEPT';
        }
        if (cmd === 'answeronnextprompt') {
          return `Handle Future Dialogs    action=ACCEPT    text=${value}`;
        }
        if (cmd === 'answeronnextpromptandwait') {
          return `Handle Future Dialogs    action=ACCEPT    text=${value}`;
        }
        if (cmd === 'assertconfirmation') {
          return `Alert Should Be Present    ${value}`;
        }
        if (cmd === 'assertalert') {
          return `Alert Should Be Present    ${value}`;
        }
        if (cmd === 'verifyalert') {
          return `Alert Should Be Present    ${value}`;
        }
        if (cmd === 'waitforalertpresent') {
          return `Wait Until Alert Is Present    ${value || '${TIMEOUT}'}`;
        }
        
        // Wait commands
        if (cmd === 'waitforelementpresent') {
          return `Wait Until Element Is Visible    ${target}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitforelementnotpresent') {
          return `Wait Until Element Is Not Visible    ${target}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitforvisible') {
          return `Wait Until Element Is Visible    ${target}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitfornotvisible') {
          return `Wait Until Element Is Not Visible    ${target}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitfortext') {
          return `Wait Until Element Contains    ${target}    ${value}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitfornottext') {
          return `Wait Until Element Does Not Contain    ${target}    ${value}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitforvalue') {
          return `Wait Until Element Attribute    ${target}    value    ${value}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitfornotvalue') {
          return `Wait Until Element Attribute    ${target}    value    ${value}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitfortitle') {
          return `Wait Until Title Contains    ${value}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitfornottitle') {
          return `Wait Until Title Does Not Contain    ${value}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitforpage') {
          return `Wait Until Page Contains    ${value}    ${value || '${TIMEOUT}'}`;
        }
        if (cmd === 'waitforpagenot') {
          return `Wait Until Page Does Not Contain    ${value}    ${value || '${TIMEOUT}'}`;
        }
        
        // Assertion commands
        if (cmd === 'asserttext') {
          return `Element Should Contain    ${target}    ${value}`;
        }
        if (cmd === 'assertnottext') {
          return `Element Should Not Contain    ${target}    ${value}`;
        }
        if (cmd === 'assertvalue') {
          return `Element Should Contain    ${target}    ${value}`;
        }
        if (cmd === 'assertnotvalue') {
          return `Element Should Not Contain    ${target}    ${value}`;
        }
        if (cmd === 'assertelementpresent') {
          return `Page Should Contain Element    ${target}`;
        }
        if (cmd === 'assertnotelementpresent') {
          return `Page Should Not Contain Element    ${target}`;
        }
        if (cmd === 'assertvisible') {
          return `Element Should Be Visible    ${target}`;
        }
        if (cmd === 'assertnotvisible') {
          return `Element Should Not Be Visible    ${target}`;
        }
        if (cmd === 'asserttitle') {
          return `Title Should Be    ${value}`;
        }
        if (cmd === 'assertnottitle') {
          return `Title Should Not Be    ${value}`;
        }
        if (cmd === 'assertchecked') {
          return `Checkbox Should Be Selected    ${target}`;
        }
        if (cmd === 'assertnotchecked') {
          return `Checkbox Should Not Be Selected    ${target}`;
        }
        if (cmd === 'assertselectedvalue') {
          return `List Selection Should Be    ${target}    ${value}`;
        }
        if (cmd === 'assertnotselectedvalue') {
          return `List Selection Should Not Be    ${target}    ${value}`;
        }
        if (cmd === 'assertselectedlabel') {
          return `List Selection Should Be    ${target}    ${value}`;
        }
        if (cmd === 'assertnotselectedlabel') {
          return `List Selection Should Not Be    ${target}    ${value}`;
        }
        if (cmd === 'assertattribute') {
          const parts = value.split('=');
          if (parts.length >= 2) {
            return `Element Attribute Value Should Be    ${target}    ${parts[0].trim()}    ${parts[1].trim()}`;
          }
          return `Element Should Have Attribute    ${target}    ${value}`;
        }
        if (cmd === 'assertnotattribute') {
          return `Element Should Not Have Attribute    ${target}    ${value}`;
        }
        
        // Verify commands (same as assert but with different naming)
        if (cmd === 'verifytext') {
          return `Element Should Contain    ${target}    ${value}`;
        }
        if (cmd === 'verifynottext') {
          return `Element Should Not Contain    ${target}    ${value}`;
        }
        if (cmd === 'verifyvalue') {
          return `Element Should Contain    ${target}    ${value}`;
        }
        if (cmd === 'verifynotvalue') {
          return `Element Should Not Contain    ${target}    ${value}`;
        }
        if (cmd === 'verifyelementpresent') {
          return `Page Should Contain Element    ${target}`;
        }
        if (cmd === 'verifynotelementpresent') {
          return `Page Should Not Contain Element    ${target}`;
        }
        if (cmd === 'verifyvisible') {
          return `Element Should Be Visible    ${target}`;
        }
        if (cmd === 'verifynotvisible') {
          return `Element Should Not Be Visible    ${target}`;
        }
        if (cmd === 'verifytitle') {
          return `Title Should Be    ${value}`;
        }
        if (cmd === 'verifynottitle') {
          return `Title Should Not Be    ${value}`;
        }
        if (cmd === 'verifychecked') {
          return `Checkbox Should Be Selected    ${target}`;
        }
        if (cmd === 'verifynotchecked') {
          return `Checkbox Should Not Be Selected    ${target}`;
        }
        if (cmd === 'verifyselectedvalue') {
          return `List Selection Should Be    ${target}    ${value}`;
        }
        if (cmd === 'verifynotselectedvalue') {
          return `List Selection Should Not Be    ${target}    ${value}`;
        }
        if (cmd === 'verifyselectedlabel') {
          return `List Selection Should Be    ${target}    ${value}`;
        }
        if (cmd === 'verifynotselectedlabel') {
          return `List Selection Should Not Be    ${target}    ${value}`;
        }
        if (cmd === 'verifyattribute') {
          const parts = value.split('=');
          if (parts.length >= 2) {
            return `Element Attribute Value Should Be    ${target}    ${parts[0].trim()}    ${parts[1].trim()}`;
          }
          return `Element Should Have Attribute    ${target}    ${value}`;
        }
        if (cmd === 'verifynotattribute') {
          return `Element Should Not Have Attribute    ${target}    ${value}`;
        }
        
        // Store commands
        if (cmd === 'store') {
          return `Set Test Variable    ${target}    ${value}`;
        }
        if (cmd === 'storetext') {
          return `Get Text    ${target}    ${value}`;
        }
        if (cmd === 'storevalue') {
          return `Get Element Attribute    ${target}    value    ${value}`;
        }
        if (cmd === 'storetitle') {
          return `Get Title    ${value}`;
        }
        if (cmd === 'storeattribute') {
          const parts = value.split('=');
          if (parts.length >= 2) {
            return `Get Element Attribute    ${target}    ${parts[0].trim()}    ${parts[1].trim()}`;
          }
          return `Get Element Attribute    ${target}    ${value}`;
        }
        if (cmd === 'storeelementpresent') {
          return `Get Element Count    ${target}    ${value}`;
        }
        if (cmd === 'storevisible') {
          return `Get Element Count    ${target}    ${value}`;
        }
        if (cmd === 'storechecked') {
          return `Get Element Attribute    ${target}    checked    ${value}`;
        }
        if (cmd === 'storeselectedvalue') {
          return `Get Selected List Value    ${target}    ${value}`;
        }
        if (cmd === 'storeselectedlabel') {
          return `Get Selected List Label    ${target}    ${value}`;
        }
        if (cmd === 'storeallwindowtitles') {
          return `Get Window Titles    ${value}`;
        }
        if (cmd === 'storeallwindownames') {
          return `Get Window Names    ${value}`;
        }
        if (cmd === 'storeallwindowids') {
          return `Get Window Identifiers    ${value}`;
        }
        if (cmd === 'storewindowhandle') {
          return `Get Window Handle    ${value}`;
        }
        if (cmd === 'storeallwindowhandles') {
          return `Get Window Handles    ${value}`;
        }
        
        // JavaScript execution
        if (cmd === 'runscript') {
          return `Execute Javascript    ${target}`;
        }
        if (cmd === 'runscriptandwait') {
          return `Execute Javascript    ${target}`;
        }
        if (cmd === 'geteval') {
          return `Execute Javascript    return ${target}`;
        }
        if (cmd === 'storeeval') {
          return `Execute Javascript    ${target}    ${value}`;
        }
        
        // Screenshot commands
        if (cmd === 'capturescreenshot') {
          return `Capture Page Screenshot    ${target || 'screenshot.png'}`;
        }
        if (cmd === 'captureentirepagescreenshot') {
          return `Capture Page Screenshot    ${target || 'screenshot.png'}`;
        }
        
        // Cookie commands
        if (cmd === 'deletecookie') {
          return `Delete Cookie    ${target}`;
        }
        if (cmd === 'deleteallvisiblecookies') {
          return 'Delete All Cookies';
        }
        if (cmd === 'addcookie') {
          const parts = value.split(',');
          if (parts.length >= 2) {
            return `Add Cookie    ${target}    ${parts[0].trim()}    ${parts[1].trim()}`;
          }
          return `Add Cookie    ${target}    ${value}`;
        }
        
        // Browser control
        if (cmd === 'close') {
          return 'Close Browser';
        }
        if (cmd === 'closeandwait') {
          return 'Close Browser';
        }
        if (cmd === 'setwindowposition') {
          const parts = value.split(',');
          if (parts.length >= 2) {
            return `Set Window Position    ${parts[0].trim()}    ${parts[1].trim()}`;
          }
          return `Set Window Position    ${value}`;
        }
        if (cmd === 'setwindowsize') {
          const parts = value.split(',');
          if (parts.length >= 2) {
            return `Set Window Size    ${parts[0].trim()}    ${parts[1].trim()}`;
          }
          return `Set Window Size    ${value}`;
        }
        if (cmd === 'maximizewindow') {
          return 'Maximize Browser Window';
        }
        if (cmd === 'maximizewindowandwait') {
          return 'Maximize Browser Window';
        }
        if (cmd === 'minimizewindow') {
          return 'Minimize Browser Window';
        }
        if (cmd === 'minimizewindowandwait') {
          return 'Minimize Browser Window';
        }
        if (cmd === 'bringbrowsertoforeground') {
          return 'Maximize Browser Window';
        }
        if (cmd === 'bringbrowsertoforegroundandwait') {
          return 'Maximize Browser Window';
        }
        
        // Speed and timeout
        if (cmd === 'setspeed') {
          return `Set Selenium Speed    ${target}`;
        }
        if (cmd === 'setspeedandwait') {
          return `Set Selenium Speed    ${target}`;
        }
        if (cmd === 'settimeout') {
          return `Set Selenium Timeout    ${target}`;
        }
        if (cmd === 'settimeoutandwait') {
          return `Set Selenium Timeout    ${target}`;
        }
        
        // Utility commands
        if (cmd === 'pause') {
          return `Sleep    ${target}`;
        }
        if (cmd === 'echo') {
          return `Log    ${target}`;
        }
        if (cmd === 'comment') {
          return `# ${target}`;
        }
        if (cmd === 'break') {
          return 'Fail    Test execution stopped by break command';
        }
        
        // Default case - log unsupported command
        return `# Unsupported command: ${cmd} ${target} ${value}`;
      };

      return {
        formatter: formatter
      };
    };

    let content = robotFramework(name).formatter(commands);
    return {
      content: content,
      extension: 'robot',
      mimetype: 'text/plain'
    };
  };
});
