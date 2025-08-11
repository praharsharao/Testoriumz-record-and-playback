const robotFramework = function() {
    this.name = "Robot Framework";
    this.description = "Generate Robot Framework test cases from Selenium IDE commands";
    this.version = "1.0";
    this.homepage = "https://robotframework.org/";

    this.generate = function(script) {
        let result = "";
        result += "*** Settings ***\n";
        result += "Library    SeleniumLibrary\n";
        result += "Library    Collections\n\n";
        
        result += "*** Variables ***\n";
        result += "${BROWSER}    chrome\n";
        result += "${BASE_URL}    " + this.getBaseUrl(script) + "\n\n";
        
        result += "*** Test Cases ***\n";
        result += this.getTestCaseName(script) + "\n";
        result += "    [Documentation]    " + this.getTestCaseName(script) + "\n";
        result += "    [Tags]    selenium    web\n\n";
        
        result += "    Open Browser    ${BASE_URL}    ${BROWSER}\n";
        result += "    Maximize Browser Window\n\n";
        
        // Convert each command to Robot Framework syntax
        for (let i = 0; i < script.commands.length; i++) {
            const command = script.commands[i];
            const robotCommand = this.convertCommand(command, i);
            if (robotCommand) {
                result += "    " + robotCommand + "\n";
            }
        }
        
        result += "\n    [Teardown]    Close Browser\n";
        
        return result;
    };

    this.getBaseUrl = function(script) {
        // Try to find the first 'open' command to get base URL
        for (let i = 0; i < script.commands.length; i++) {
            const command = script.commands[i];
            if (command.command === "open" && command.target) {
                try {
                    const url = new URL(command.target);
                    return url.origin;
                } catch (e) {
                    return command.target;
                }
            }
        }
        return "https://example.com";
    };

    this.getTestCaseName = function(script) {
        return script.name || "Untitled Test Case";
    };

    this.convertCommand = function(command, index) {
        const cmd = command.command.toLowerCase();
        const target = command.target || "";
        const value = command.value || "";
        
        // Convert common Selenium commands to Robot Framework
        switch (cmd) {
            case "open":
                if (target.startsWith("http")) {
                    return `Go To    ${target}`;
                } else {
                    return `Go To    ${target}`;
                }
                
            case "click":
                if (target.startsWith("link=")) {
                    const linkText = target.replace("link=", "");
                    return `Click Link    ${linkText}`;
                } else {
                    return `Click Element    ${target}`;
                }
                
            case "clickandwait":
                if (target.startsWith("link=")) {
                    const linkText = target.replace("link=", "");
                    return `Click Link    ${linkText}`;
                } else {
                    return `Click Element    ${target}`;
                }
                
            case "type":
                if (value && value.trim()) {
                    return `Input Text    ${target}    ${value}`;
                } else {
                    return `Input Text    ${target}    `;
                }
                
            case "typeandwait":
                if (value && value.trim()) {
                    return `Input Text    ${target}    ${value}`;
                } else {
                    return `Input Text    ${target}    `;
                }
                
            case "select":
                if (value && value.trim()) {
                    return `Select From List By Label    ${target}    ${value}`;
                } else {
                    return `Select From List By Index    ${target}    0`;
                }
                
            case "selectandwait":
                if (value && value.trim()) {
                    return `Select From List By Label    ${target}    ${value}`;
                } else {
                    return `Select From List By Index    ${target}    0`;
                }
                
            case "submit":
                return `Submit Form    ${target}`;
                
            case "submitandwait":
                return `Submit Form    ${target}`;
                
            case "pause":
                return `Sleep    ${target || "1s"}`;
                
            case "refresh":
                return `Reload Page`;
                
            case "refreshandwait":
                return `Reload Page`;
                
            case "goback":
                return `Go Back`;
                
            case "gobackandwait":
                return `Go Back`;
                
            case "selectwindow":
                return `Switch Window    ${target}`;
                
            case "selectframe":
                return `Switch Frame    ${target}`;
                
            case "doubleclick":
                return `Double Click Element    ${target}`;
                
            case "doubleclickandwait":
                return `Double Click Element    ${target}`;
                
            case "mouseover":
                return `Mouse Over    ${target}`;
                
            case "mouseoverandwait":
                return `Mouse Over    ${target}`;
                
            case "draganddroptoobject":
                const parts = target.split(",");
                if (parts.length === 2) {
                    return `Drag And Drop    ${parts[0].trim()}    ${parts[1].trim()}`;
                } else {
                    return `Drag And Drop    ${target}`;
                }
                
            case "sendkeys":
                return `Press Keys    ${target}    ${value}`;
                
            case "clear":
                return `Clear Element Text    ${target}`;
                
            case "focus":
                return `Focus    ${target}`;
                
            case "waitforelementpresent":
                return `Wait Until Page Contains Element    ${target}`;
                
            case "waitforelementvisible":
                return `Wait Until Element Is Visible    ${target}`;
                
            case "waitforelementclickable":
                return `Wait Until Element Is Clickable    ${target}`;
                
            case "waitfortext":
                return `Wait Until Page Contains    ${target}`;
                
            case "waitforpagetoload":
                return `Wait Until Page Contains Element    //body`;
                
            case "asserttext":
                return `Page Should Contain    ${target}`;
                
            case "assertnottext":
                return `Page Should Not Contain    ${target}`;
                
            case "assertelementpresent":
                return `Element Should Be Visible    ${target}`;
                
            case "assertelementnotpresent":
                return `Element Should Not Be Visible    ${target}`;
                
            case "verifytext":
                return `Page Should Contain    ${target}`;
                
            case "verifynottext":
                return `Page Should Not Contain    ${target}`;
                
            case "verifyelementpresent":
                return `Element Should Be Visible    ${target}`;
                
            case "verifyelementnotpresent":
                return `Element Should Not Be Visible    ${target}`;
                
            case "storetitle":
                return `${target} =    Get Title`;
                
            case "storetext":
                return `${target} =    Get Text    ${value}`;
                
            case "storevalue":
                return `${target} =    Get Value    ${value}`;
                
            case "captureentirepagescreenshot":
                return `Capture Page Screenshot    ${target || "screenshot.png"}`;
                
            case "capturescreenshot":
                return `Capture Page Screenshot    ${target || "screenshot.png"}`;
                
            case "echo":
                return `Log    ${target}`;
                
            case "comment":
                return `# ${target}`;
                
            // Additional Robot Framework specific commands
            case "waituntillocationcontains":
                return `Wait Until Location Contains    ${target}`;
                
            case "waituntillocationis":
                return `Wait Until Location Is    ${target}`;
                
            case "locationshouldbe":
                return `Location Should Be    ${target}`;
                
            case "locationshouldcontain":
                return `Location Should Contain    ${target}`;
                
            case "titleshouldbe":
                return `Title Should Be    ${target}`;
                
            case "titleshouldcontain":
                return `Title Should Contain    ${target}`;
                
            case "elementshouldcontain":
                return `Element Should Contain    ${target}    ${value}`;
                
            case "elementshouldnotcontain":
                return `Element Should Not Contain    ${target}    ${value}`;
                
            case "elementshouldbeequal":
                return `Element Should Be Equal    ${target}    ${value}`;
                
            case "elementshouldnotbeequal":
                return `Element Should Not Be Equal    ${target}    ${value}`;
                
            case "checkboxshouldbeselected":
                return `Checkbox Should Be Selected    ${target}`;
                
            case "checkboxshouldnotbeselected":
                return `Checkbox Should Not Be Selected    ${target}`;
                
            case "radiobuttonshouldbesetto":
                return `Radio Button Should Be Set To    ${target}    ${value}`;
                
            case "listselectionshouldbe":
                return `List Selection Should Be    ${target}    ${value}`;
                
            case "listshouldhavenoselections":
                return `List Should Have No Selections    ${target}`;
                
            case "tableshouldcontain":
                return `Table Should Contain    ${target}    ${value}`;
                
            case "tableheadershouldcontain":
                return `Table Header Should Contain    ${target}    ${value}`;
                
            case "tablerowshouldcontain":
                return `Table Row Should Contain    ${target}    ${value}`;
                
            case "tablecolumnshouldcontain":
                return `Table Column Should Contain    ${target}    ${value}`;
                
            case "cookieshouldexist":
                return `Cookie Should Exist    ${target}`;
                
            case "cookieshouldnotexist":
                return `Cookie Should Not Exist    ${target}`;
                
            case "cookievalueshouldbe":
                return `Cookie Value Should Be    ${target}    ${value}`;
                
            case "deleteallcookies":
                return `Delete All Cookies`;
                
            case "handlealert":
                return `Handle Alert    ${target}`;
                
            case "alertshouldbepresent":
                return `Alert Should Be Present`;
                
            case "choosefile":
                return `Choose File    ${target}    ${value}`;
                
            case "choosecancelonnextconfirmation":
                return `Choose Cancel On Next Confirmation`;
                
            case "chooseokonnextconfirmation":
                return `Choose Ok On Next Confirmation`;
                
            case "confirmaction":
                return `Confirm Action`;
                
            case "dismissaction":
                return `Dismiss Action`;
                
            default:
                // For Robot Framework commands that are already in the right format
                if (command.command.startsWith("Go To") || 
                    command.command.startsWith("Click Element") ||
                    command.command.startsWith("Click Link") ||
                    command.command.startsWith("Input Text") ||
                    command.command.startsWith("Input Password") ||
                    command.command.startsWith("Select From List") ||
                    command.command.startsWith("Wait Until") ||
                    command.command.startsWith("Page Should") ||
                    command.command.startsWith("Element Should") ||
                    command.command.startsWith("Get ") ||
                    command.command.startsWith("Capture Page Screenshot") ||
                    command.command.startsWith("Sleep") ||
                    command.command.startsWith("Go Back") ||
                    command.command.startsWith("Reload Page") ||
                    command.command.startsWith("Switch Window") ||
                    command.command.startsWith("Switch Frame") ||
                    command.command.startsWith("Double Click Element") ||
                    command.command.startsWith("Mouse Over") ||
                    command.command.startsWith("Drag And Drop") ||
                    command.command.startsWith("Press Keys") ||
                    command.command.startsWith("Clear Element Text") ||
                    command.command.startsWith("Focus") ||
                    command.command.startsWith("Scroll Element Into View") ||
                    command.command.startsWith("Location Should") ||
                    command.command.startsWith("Title Should") ||
                    command.command.startsWith("Checkbox Should") ||
                    command.command.startsWith("Radio Button Should") ||
                    command.command.startsWith("List Selection Should") ||
                    command.command.startsWith("List Should Have") ||
                    command.command.startsWith("Table Should") ||
                    command.command.startsWith("Cookie Should") ||
                    command.command.startsWith("Delete All Cookies") ||
                    command.command.startsWith("Handle Alert") ||
                    command.command.startsWith("Alert Should") ||
                    command.command.startsWith("Choose File") ||
                    command.command.startsWith("Choose Cancel") ||
                    command.command.startsWith("Choose Ok") ||
                    command.command.startsWith("Confirm Action") ||
                    command.command.startsWith("Dismiss Action")) {
                    
                    if (value && value.trim()) {
                        return `${command.command}    ${target}    ${value}`;
                    } else if (target && target.trim()) {
                        return `${command.command}    ${target}`;
                    } else {
                        return command.command;
                    }
                }
                
                // For unknown commands, try to convert them
                return `# TODO: Convert command "${command.command}" to Robot Framework`;
        }
    };

    this.getOptionPanel = function() {
        return null;
    };

    this.setOptions = function(options) {
        // No options needed for Robot Framework
    };
};

// Register the formatter
if (typeof module !== 'undefined' && module.exports) {
    module.exports = robotFramework;
} else {
    window.robotFramework = robotFramework;
}

// Register with newFormatters for Katalon Recorder - immediate registration
if (typeof newFormatters !== 'undefined') {
    newFormatters.robotframework = function(name, commands) {
        const formatter = new robotFramework();
        const content = formatter.generate({ name: name, commands: commands });
        return {
            content: content,
            extension: 'robot',
            mimetype: 'text/plain'
        };
    };
} else {
    // Fallback: register when newFormatters becomes available
    window.addEventListener('load', function() {
        if (typeof newFormatters !== 'undefined') {
            newFormatters.robotframework = function(name, commands) {
                const formatter = new robotFramework();
                const content = formatter.generate({ name: name, commands: commands });
                return {
                    content: content,
                    extension: 'robot',
                    mimetype: 'text/plain'
                };
            };
        }
    });
}

// Also try jQuery document ready as backup
$(document).ready(function(){
    if (typeof newFormatters !== 'undefined') {
        newFormatters.robotframework = function(name, commands) {
            const formatter = new robotFramework();
            const content = formatter.generate({ name: name, commands: commands });
            return {
                content: content,
                extension: 'robot',
                mimetype: 'text/plain'
            };
        };
    }
}); 