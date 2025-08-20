// Special handler for dropdown and calendar interactions
// This ensures proper recording of dropdown and calendar selections

function handleDropdownSelection(element, value) {
    // Detect if this is a dropdown/select element
    if (element.tagName.toLowerCase() === 'select') {
        // For select elements, use Select From List commands
        if (element.multiple) {
            return {
                command: 'Select Multiple Options From Dropdown',
                target: buildLocator(element),
                value: value
            };
        } else {
            return {
                command: 'Select Option From Dropdown',
                target: buildLocator(element),
                value: value
            };
        }
    }
    
    // For custom dropdowns (div-based), use Click Element
    return {
        command: 'Click Element',
        target: buildLocator(element),
        value: value
    };
}

function handleCalendarSelection(element, dateValue) {
    // Detect if this is a calendar input
    if (element.type === 'date' || element.type === 'datetime-local') {
        return {
            command: 'Set Date',
            target: buildLocator(element),
            value: dateValue
        };
    }
    
    // For custom calendar widgets, use Select Date From Calendar
    return {
        command: 'Select Date From Calendar',
        target: buildLocator(element),
        value: dateValue
    };
}

function handleTimeSelection(element, timeValue) {
    // Detect if this is a time input
    if (element.type === 'time') {
        return {
            command: 'Set Time',
            target: buildLocator(element),
            value: timeValue
        };
    }
    
    // For custom time dropdowns
    return {
        command: 'Select Time From Dropdown',
        target: buildLocator(element),
        value: timeValue
    };
}

function buildLocator(element) {
    // Build a robust locator for the element
    let locator = '';
    
    if (element.id) {
        locator = `id=${element.id}`;
    } else if (element.name) {
        locator = `name=${element.name}`;
    } else if (element.className) {
        locator = `css=.${element.className.split(' ').join('.')}`;
    } else {
        // Fallback to XPath
        locator = `xpath=//${element.tagName.toLowerCase()}`;
        if (element.textContent) {
            locator += `[contains(text(),'${element.textContent.trim()}')]`;
        }
    }
    
    return locator;
}

// Override the default recording behavior for select elements
function enhanceRecordingForSelects() {
    // Listen for change events on select elements
    document.addEventListener('change', function(event) {
        if (event.target.tagName.toLowerCase() === 'select') {
            const selectedValue = event.target.value;
            const selectedText = event.target.options[event.target.selectedIndex]?.text;
            
            // Use the text if available, otherwise use the value
            const displayValue = selectedText || selectedValue;
            
            const command = handleDropdownSelection(event.target, displayValue);
            
            // Record the command if we're in Robot Framework mode
            if (window.loadRobotFrameworkCommands && typeof convertToRobotFrameworkCommand === 'function') {
                const converted = convertToRobotFrameworkCommand(command.command, command.target, command.value);
                // This will be handled by the existing recording mechanism
            }
        }
    }, true);
    
    // Listen for input events on date/time inputs
    document.addEventListener('input', function(event) {
        if (event.target.type === 'date' || event.target.type === 'time' || event.target.type === 'datetime-local') {
            const command = event.target.type === 'time' ? 
                handleTimeSelection(event.target, event.target.value) :
                handleCalendarSelection(event.target, event.target.value);
            
            // Record the command if we're in Robot Framework mode
            if (window.loadRobotFrameworkCommands && typeof convertToRobotFrameworkCommand === 'function') {
                const converted = convertToRobotFrameworkCommand(command.command, command.target, command.value);
                // This will be handled by the existing recording mechanism
            }
        }
    }, true);
}

// Initialize the enhanced recording when the page loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', enhanceRecordingForSelects);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleDropdownSelection,
        handleCalendarSelection,
        handleTimeSelection,
        buildLocator,
        enhanceRecordingForSelects
    };
}
