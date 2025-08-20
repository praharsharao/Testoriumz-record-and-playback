// Enhanced dropdown detection and recording
// This file improves the recorder's ability to detect dropdown interactions

class DropdownDetector {
    constructor() {
        this.isRecording = false;
        this.dropdownStates = new Map();
        this.init();
    }

    init() {
        // Listen for recording start/stop
        this.listenForRecordingState();
        
        // Enhanced dropdown detection
        this.enhanceDropdownDetection();
        
        // Custom dropdown detection (for non-select elements)
        this.detectCustomDropdowns();
        
        // Calendar and date picker detection
        this.detectDatePickers();
    }

    listenForRecordingState() {
        // Listen for messages from the background script
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.attachRecorder) {
                this.isRecording = true;
                this.attachDropdownListeners();
            } else if (message.detachRecorder) {
                this.isRecording = false;
                this.detachDropdownListeners();
            }
        });
    }

    enhanceDropdownDetection() {
        // Enhanced select element detection
        document.addEventListener('change', (event) => {
            if (!this.isRecording) return;
            
            const target = event.target;
            if (target.tagName.toLowerCase() === 'select') {
                this.handleSelectChange(target, event);
            }
        }, true);

        // Enhanced click detection for dropdowns
        document.addEventListener('click', (event) => {
            if (!this.isRecording) return;
            
            const target = event.target;
            this.handleDropdownClick(target, event);
        }, true);

        // Enhanced focus detection
        document.addEventListener('focus', (event) => {
            if (!this.isRecording) return;
            
            const target = event.target;
            this.handleDropdownFocus(target, event);
        }, true);
    }

    detectCustomDropdowns() {
        // Detect custom dropdown implementations (div-based, ul-based, etc.)
        const customDropdownSelectors = [
            '[role="listbox"]',
            '[role="combobox"]',
            '.dropdown',
            '.select',
            '.combobox',
            '[data-dropdown]',
            '[data-select]',
            '.ant-select',
            '.el-select',
            '.v-select',
            '.react-select',
            '.select2',
            '.chosen',
            '.bootstrap-select'
        ];

        // Observe DOM changes to detect dynamically added dropdowns
        const observer = new MutationObserver((mutations) => {
            if (!this.isRecording) return;
            
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.detectDropdownInElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial detection
        this.detectDropdownInElement(document.body);
    }

    detectDropdownInElement(element) {
        const dropdownSelectors = [
            '[role="listbox"]',
            '[role="combobox"]',
            '.dropdown',
            '.select',
            '.combobox',
            '[data-dropdown]',
            '[data-select]'
        ];

        dropdownSelectors.forEach(selector => {
            const dropdowns = element.querySelectorAll ? element.querySelectorAll(selector) : [];
            dropdowns.forEach(dropdown => {
                this.attachCustomDropdownListeners(dropdown);
            });
        });
    }

    attachCustomDropdownListeners(dropdown) {
        // Listen for clicks on dropdown options
        dropdown.addEventListener('click', (event) => {
            if (!this.isRecording) return;
            
            const option = this.findDropdownOption(event.target);
            if (option) {
                this.handleCustomDropdownSelection(dropdown, option, event);
            }
        }, true);

        // Listen for keyboard navigation
        dropdown.addEventListener('keydown', (event) => {
            if (!this.isRecording) return;
            
            if (event.key === 'Enter' || event.key === ' ') {
                const selectedOption = this.getSelectedOption(dropdown);
                if (selectedOption) {
                    this.handleCustomDropdownSelection(dropdown, selectedOption, event);
                }
            }
        }, true);
    }

    detectDatePickers() {
        // Detect date picker inputs and calendar widgets
        const dateSelectors = [
            'input[type="date"]',
            'input[type="datetime-local"]',
            'input[type="time"]',
            '.datepicker',
            '.datetimepicker',
            '.timepicker',
            '[data-datepicker]',
            '[data-datetimepicker]',
            '[data-timepicker]'
        ];

        dateSelectors.forEach(selector => {
            const dateInputs = document.querySelectorAll(selector);
            dateInputs.forEach(input => {
                this.attachDatePickerListeners(input);
            });
        });
    }

    attachDatePickerListeners(input) {
        // Listen for date selection
        input.addEventListener('change', (event) => {
            if (!this.isRecording) return;
            
            this.handleDateSelection(input, event);
        }, true);

        // Listen for date picker popup interactions
        input.addEventListener('click', (event) => {
            if (!this.isRecording) return;
            
            this.handleDatePickerClick(input, event);
        }, true);
    }

    handleSelectChange(select, event) {
        const selectedOption = select.options[select.selectedIndex];
        const selectedText = selectedOption ? selectedOption.text : '';
        const selectedValue = select.value;
        
        // Determine the best command based on Robot Framework mode
        let command, value;
        
        if (window.loadRobotFrameworkCommands) {
            if (select.multiple) {
                command = 'Select Multiple Options From Dropdown';
            } else {
                command = 'Select Option From Dropdown';
            }
            value = selectedText || selectedValue;
        } else {
            command = 'select';
            value = selectedValue;
        }

        // Record the command
        this.recordCommand(command, this.buildLocator(select), value);
    }

    handleDropdownClick(target, event) {
        // Check if this is a dropdown option click
        const dropdown = this.findParentDropdown(target);
        if (dropdown) {
            const option = this.findDropdownOption(target);
            if (option) {
                this.handleCustomDropdownSelection(dropdown, option, event);
            }
        }
    }

    handleDropdownFocus(target, event) {
        // Store dropdown state when focused
        if (this.isDropdownElement(target)) {
            this.dropdownStates.set(target, {
                focused: true,
                timestamp: Date.now()
            });
        }
    }

    handleCustomDropdownSelection(dropdown, option, event) {
        const optionText = this.getOptionText(option);
        const optionValue = this.getOptionValue(option);
        
        // Determine the best command
        let command, value;
        
        if (window.loadRobotFrameworkCommands) {
            command = 'Select Option From Dropdown';
            value = optionText || optionValue;
        } else {
            command = 'click';
            value = '';
        }

        // Record the command
        this.recordCommand(command, this.buildLocator(dropdown), value);
    }

    handleDateSelection(input, event) {
        const dateValue = input.value;
        
        let command, value;
        
        if (window.loadRobotFrameworkCommands) {
            if (input.type === 'time') {
                command = 'Set Time';
            } else {
                command = 'Set Date';
            }
            value = dateValue;
        } else {
            command = 'type';
            value = dateValue;
        }

        this.recordCommand(command, this.buildLocator(input), value);
    }

    handleDatePickerClick(input, event) {
        // Record the click to open the date picker
        if (window.loadRobotFrameworkCommands) {
            this.recordCommand('Click Element', this.buildLocator(input), '');
        } else {
            this.recordCommand('click', this.buildLocator(input), '');
        }
    }

    findParentDropdown(element) {
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            if (this.isDropdownElement(parent)) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }

    isDropdownElement(element) {
        if (!element) return false;
        
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const className = element.className || '';
        
        return (
            tagName === 'select' ||
            role === 'listbox' ||
            role === 'combobox' ||
            className.includes('dropdown') ||
            className.includes('select') ||
            className.includes('combobox') ||
            element.hasAttribute('data-dropdown') ||
            element.hasAttribute('data-select')
        );
    }

    findDropdownOption(element) {
        // Check if element is a dropdown option
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const className = element.className || '';
        
        return (
            tagName === 'option' ||
            role === 'option' ||
            className.includes('option') ||
            className.includes('item') ||
            className.includes('choice') ||
            element.hasAttribute('data-value') ||
            element.hasAttribute('data-option')
        );
    }

    getSelectedOption(dropdown) {
        // Get the currently selected option from a dropdown
        if (dropdown.tagName.toLowerCase() === 'select') {
            return dropdown.options[dropdown.selectedIndex];
        }
        
        // For custom dropdowns, look for selected state
        const selectedOption = dropdown.querySelector('[aria-selected="true"], .selected, .active, [data-selected="true"]');
        return selectedOption;
    }

    getOptionText(option) {
        // Get the display text of an option
        return option.textContent?.trim() || option.getAttribute('data-text') || option.getAttribute('title') || '';
    }

    getOptionValue(option) {
        // Get the value of an option
        return option.value || option.getAttribute('data-value') || option.getAttribute('value') || '';
    }

    buildLocator(element) {
        // Build a robust locator for the element
        if (element.id) {
            return `id=${element.id}`;
        } else if (element.name) {
            return `name=${element.name}`;
        } else if (element.className) {
            const classes = element.className.split(' ').filter(c => c.trim()).join('.');
            return `css=.${classes}`;
        } else {
            // Fallback to XPath
            return `xpath=//${element.tagName.toLowerCase()}`;
        }
    }

    recordCommand(command, target, value) {
        // Send the command to the recorder
        if (typeof browser !== 'undefined' && browser.runtime) {
            browser.runtime.sendMessage({
                command: command,
                target: [[target]],
                value: value
            }).catch(() => {
                // Silently fail if recorder is not available
            });
        }
    }

    attachDropdownListeners() {
        // Attach listeners when recording starts
        this.enhanceDropdownDetection();
        this.detectCustomDropdowns();
        this.detectDatePickers();
    }

    detachDropdownListeners() {
        // Clean up listeners when recording stops
        this.dropdownStates.clear();
    }
}

// Initialize the dropdown detector
const dropdownDetector = new DropdownDetector();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DropdownDetector;
}
