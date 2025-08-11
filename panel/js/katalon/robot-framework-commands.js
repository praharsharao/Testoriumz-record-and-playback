// Robot Framework SeleniumLibrary Keywords for Testoriumz Recorder
// This file contains all the essential Robot Framework keywords that will appear in the command dropdown

const robotFrameworkCommands = [
    // Navigation Keywords
    'Go To',
    'Go Back',
    'Reload Page',
    'Get Location',
    'Get Title',
    
    // Element Interaction Keywords
    'Click Element',
    'Click Link',
    'Click Button',
    'Click Image',
    'Double Click Element',
    'Right Click Element',
    'Mouse Over',
    'Mouse Out',
    'Drag And Drop',
    'Drag And Drop By Offset',
    
    // Text Input Keywords
    'Input Text',
    'Input Password',
    'Clear Element Text',
    'Press Keys',
    'Submit Form',
    
    // Selection Keywords
    'Select From List By Label',
    'Select From List By Value',
    'Select From List By Index',
    'Select All From List',
    'Unselect From List By Label',
    'Unselect From List By Value',
    'Unselect From List By Index',
    'Unselect All From List',
    'Get Selected List Labels',
    'Get Selected List Values',
    'List Selection Should Be',
    'List Should Have No Selections',
    
    // Wait Keywords
    'Wait Until Element Is Visible',
    'Wait Until Element Is Not Visible',
    'Wait Until Element Is Clickable',
    'Wait Until Element Is Not Clickable',
    'Wait Until Element Is Enabled',
    'Wait Until Element Is Disabled',
    'Wait Until Element Is Focused',
    'Wait Until Element Is Not Focused',
    'Wait Until Element Is Selected',
    'Wait Until Element Is Not Selected',
    'Wait Until Page Contains',
    'Wait Until Page Does Not Contain',
    'Wait Until Page Contains Element',
    'Wait Until Page Does Not Contain Element',
    'Wait Until Location Contains',
    'Wait Until Location Is',
    'Wait Until Location Does Not Contain',
    'Wait Until Location Is Not',
    'Wait Until Title Contains',
    'Wait Until Title Does Not Contain',
    'Wait Until Title Is',
    'Wait Until Title Is Not',
    'Sleep',
    
    // Verification Keywords
    'Page Should Contain',
    'Page Should Not Contain',
    'Page Should Contain Element',
    'Page Should Not Contain Element',
    'Element Should Be Visible',
    'Element Should Not Be Visible',
    'Element Should Be Clickable',
    'Element Should Not Be Clickable',
    'Element Should Be Enabled',
    'Element Should Be Disabled',
    'Element Should Be Focused',
    'Element Should Not Be Focused',
    'Element Should Be Selected',
    'Element Should Not Be Selected',
    'Element Should Contain',
    'Element Should Not Contain',
    'Element Should Be Equal',
    'Element Should Not Be Equal',
    'Element Should Match',
    'Element Should Not Match',
    'Element Should Be Empty',
    'Element Should Not Be Empty',
    
    // Text and Value Keywords
    'Get Text',
    'Get Value',
    'Get Element Attribute',
    'Get Element Count',
    'Get List Items',
    'Get WebElements',
    'Get All Links',
    'Get All Buttons',
    'Get All Images',
    'Get All Inputs',
    
    // Window and Frame Keywords
    'Switch Window',
    'Switch Frame',
    'Select Frame',
    'Unselect Frame',
    'Get Window Handles',
    'Get Window Identifiers',
    'Get Window Names',
    'Get Window Titles',
    'Get Window Size',
    'Get Window Position',
    'Maximize Browser Window',
    'Set Window Size',
    'Set Window Position',
    'Close Window',
    'Close All Browsers',
    
    // Alert Keywords
    'Handle Alert',
    'Input Text Into Alert',
    'Choose Ok On Next Confirmation',
    'Choose Cancel On Next Confirmation',
    'Confirm Action',
    'Dismiss Action',
    
    // Screenshot and Logging Keywords
    'Capture Page Screenshot',
    'Capture Element Screenshot',
    'Set Screenshot Directory',
    'Log Source',
    'Log Title',
    'Log Location',
    
    // Cookie Keywords
    'Add Cookie',
    'Delete Cookie',
    'Delete All Cookies',
    'Get Cookie Value',
    'Get Cookie Names',
    'Get All Cookies',
    
    // JavaScript Keywords
    'Execute JavaScript',
    'Execute Async JavaScript',
    'Set Focus To Element',
    'Scroll Element Into View',
    'Scroll To',
    'Scroll To Position',
    
    // File Upload Keywords
    'Choose File',
    'Choose Multiple Files',
    
    // Table Keywords
    'Get Table Cell',
    'Table Cell Should Contain',
    'Table Cell Should Not Contain',
    'Table Column Should Contain',
    'Table Column Should Not Contain',
    'Table Footer Should Contain',
    'Table Header Should Contain',
    'Table Row Should Contain',
    'Table Row Should Not Contain',
    'Table Should Contain',
    'Table Should Not Contain',
    
    // Form Keywords
    'Checkbox Should Be Selected',
    'Checkbox Should Not Be Selected',
    'Select Checkbox',
    'Unselect Checkbox',
    'Radio Button Should Be Set To',
    'Radio Button Should Not Be Selected',
    'Select Radio Button',
    
    // Browser Keywords
    'Open Browser',
    'Close Browser',
    'Close All Browsers',
    'Get Browser Ids',
    'Get Browser Names',
    'Switch Browser',
    'Get Selenium Implicit Wait',
    'Set Selenium Implicit Wait',
    'Get Selenium Timeout',
    'Set Selenium Timeout',
    'Get Selenium Speed',
    'Set Selenium Speed',
    
    // Advanced Keywords
    'Assign Id To Element',
    'Element Should Contain',
    'Element Should Not Contain',
    'Element Should Be Equal',
    'Element Should Not Be Equal',
    'Element Should Match',
    'Element Should Not Match',
    'Element Should Be Empty',
    'Element Should Not Be Empty',
    'Element Should Be Visible',
    'Element Should Not Be Visible',
    'Element Should Be Clickable',
    'Element Should Not Be Clickable',
    'Element Should Be Enabled',
    'Element Should Be Disabled',
    'Element Should Be Focused',
    'Element Should Not Be Focused',
    'Element Should Be Selected',
    'Element Should Not Be Selected'
];

// Export the commands for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = robotFrameworkCommands;
} else if (typeof window !== 'undefined') {
    window.robotFrameworkCommands = robotFrameworkCommands;
} 