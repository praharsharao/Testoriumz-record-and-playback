// Enhanced Dropdown Recorder
// This file ensures proper recording of dropdown selections

class EnhancedDropdownRecorder {
    constructor() {
        this.isRecording = false;
        this.dropdownStates = new Map();
        this.lastDropdownClick = null;
        this.dropdownClickTimeout = null;
        this.init();
    }

    init() {
        // Enhanced dropdown detection
        this.enhanceDropdownDetection();
        
        // Monitor DOM changes for dynamic dropdowns
        this.observeDOMChanges();
        
        // Check if recording is already active
        this.checkRecordingState();
    }

    checkRecordingState() {
        // Check if we're already in recording mode
        if (typeof window !== 'undefined' && window.recorder && window.recorder.attached) {
            this.isRecording = true;
            console.log('Enhanced dropdown recorder activated (detected existing recording)');
        }
    }

    enhanceDropdownDetection() {
        // Enhanced click detection for dropdowns
        document.addEventListener('click', (event) => {
            if (!this.isRecording) return;
            
            const target = event.target;
            this.handleDropdownClick(target, event);
        }, true);

        // Enhanced change detection for select elements
        document.addEventListener('change', (event) => {
            if (!this.isRecording) return;
            
            const target = event.target;
            if (target.tagName.toLowerCase() === 'select') {
                this.handleSelectChange(target, event);
            }
        }, true);

        // Enhanced input detection for custom dropdowns
        document.addEventListener('input', (event) => {
            if (!this.isRecording) return;
            
            const target = event.target;
            this.handleCustomDropdownInput(target, event);
        }, true);

        // Enhanced focus detection
        document.addEventListener('focus', (event) => {
            if (!this.isRecording) return;
            
            const target = event.target;
            this.handleDropdownFocus(target, event);
        }, true);

        // Listen for recording state changes
        this.listenForRecordingState();
    }

    listenForRecordingState() {
        // Listen for messages from the background script
        if (typeof browser !== 'undefined' && browser.runtime) {
            browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.attachRecorder) {
                    this.isRecording = true;
                    console.log('Enhanced dropdown recorder activated');
                } else if (message.detachRecorder) {
                    this.isRecording = false;
                    console.log('Enhanced dropdown recorder deactivated');
                }
            });
        }

        // Also listen for custom events
        document.addEventListener('recordingStarted', () => {
            this.isRecording = true;
            console.log('Enhanced dropdown recorder activated (custom event)');
        });

        document.addEventListener('recordingStopped', () => {
            this.isRecording = false;
            console.log('Enhanced dropdown recorder deactivated (custom event)');
        });

        // Check periodically for recording state
        setInterval(() => {
            if (typeof window !== 'undefined' && window.recorder && window.recorder.attached && !this.isRecording) {
                this.isRecording = true;
                console.log('Enhanced dropdown recorder activated (periodic check)');
            } else if (typeof window !== 'undefined' && window.recorder && !window.recorder.attached && this.isRecording) {
                this.isRecording = false;
                console.log('Enhanced dropdown recorder deactivated (periodic check)');
            }
        }, 1000);
    }

    observeDOMChanges() {
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
            '[data-select]',
            '.ant-select',
            '.el-select',
            '.v-select',
            '.react-select',
            '.select2',
            '.chosen',
            '.bootstrap-select'
        ];

        dropdownSelectors.forEach(selector => {
            const dropdowns = element.querySelectorAll ? element.querySelectorAll(selector) : [];
            dropdowns.forEach(dropdown => {
                this.attachDropdownListeners(dropdown);
            });
        });
    }

    attachDropdownListeners(dropdown) {
        // Listen for clicks on dropdown options
        dropdown.addEventListener('click', (event) => {
            if (!this.isRecording) return;
            
            const option = this.findDropdownOption(event.target);
            if (option) {
                this.handleDropdownOptionClick(dropdown, option, event);
            }
        }, true);

        // Listen for keyboard navigation
        dropdown.addEventListener('keydown', (event) => {
            if (!this.isRecording) return;
            
            if (event.key === 'Enter' || event.key === ' ') {
                const selectedOption = this.getSelectedOption(dropdown);
                if (selectedOption) {
                    this.handleDropdownOptionClick(dropdown, selectedOption, event);
                }
            }
        }, true);
    }

    handleDropdownClick(target, event) {
        // Check if this is a dropdown-related click
        const dropdown = this.findParentDropdown(target);
        const isDropdownElement = this.isDropdownElement(target);
        
        if (dropdown || isDropdownElement) {
            console.log('Dropdown click detected:', target);
            
            // Store the dropdown click for potential selection
            this.lastDropdownClick = {
                dropdown: dropdown || target,
                timestamp: Date.now(),
                target: target
            };
            
            // Clear any existing timeout
            if (this.dropdownClickTimeout) {
                clearTimeout(this.dropdownClickTimeout);
            }
            
            // Set a timeout to record the click if no selection follows
            this.dropdownClickTimeout = setTimeout(() => {
                if (this.lastDropdownClick) {
                    this.recordDropdownClick(this.lastDropdownClick.dropdown);
                    this.lastDropdownClick = null;
                }
            }, 1000); // Wait 1 second for selection
        }
    }

    handleSelectChange(select, event) {
        console.log('Select change detected:', select);
        
        // Clear any pending dropdown click
        if (this.dropdownClickTimeout) {
            clearTimeout(this.dropdownClickTimeout);
            this.dropdownClickTimeout = null;
        }
        
        const selectedOption = select.options[select.selectedIndex];
        const selectedText = selectedOption ? selectedOption.text : '';
        const selectedValue = select.value;
        
        // Record the dropdown selection
        this.recordDropdownSelection(select, selectedText || selectedValue, select.multiple);
        
        // Clear the last dropdown click
        this.lastDropdownClick = null;
    }

    handleCustomDropdownInput(target, event) {
        // Handle custom dropdown inputs (like search/filter inputs)
        const dropdown = this.findParentDropdown(target);
        if (dropdown) {
            // This might be a search input within a dropdown
            // We'll handle the actual selection separately
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

    handleDropdownOptionClick(dropdown, option, event) {
        console.log('Dropdown option click detected:', option);
        
        // Clear any pending dropdown click
        if (this.dropdownClickTimeout) {
            clearTimeout(this.dropdownClickTimeout);
            this.dropdownClickTimeout = null;
        }
        
        const optionText = this.getOptionText(option);
        const optionValue = this.getOptionValue(option);
        
        // Record the dropdown selection
        this.recordDropdownSelection(dropdown, optionText || optionValue, false);
        
        // Clear the last dropdown click
        this.lastDropdownClick = null;
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
        const id = element.id || '';
        
        return (
            tagName === 'select' ||
            role === 'listbox' ||
            role === 'combobox' ||
            role === 'option' ||
            className.includes('dropdown') ||
            className.includes('select') ||
            className.includes('combobox') ||
            className.includes('option') ||
            className.includes('item') ||
            className.includes('choice') ||
            id.includes('dropdown') ||
            id.includes('select') ||
            element.hasAttribute('data-dropdown') ||
            element.hasAttribute('data-select') ||
            element.hasAttribute('data-option') ||
            element.hasAttribute('data-value')
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

    recordDropdownClick(dropdown) {
        // Record a click on a dropdown (to open it)
        const command = window.loadRobotFrameworkCommands ? 'Click Element' : 'click';
        const target = this.buildLocator(dropdown);
        
        console.log('Recording dropdown click:', command, target);
        this.sendCommand(command, target, '');
    }

    recordDropdownSelection(dropdown, value, isMultiple) {
        // Record a dropdown selection
        let command;
        
        if (window.loadRobotFrameworkCommands) {
            if (isMultiple) {
                command = 'Select Multiple Options From Dropdown';
            } else {
                command = 'Select Option From Dropdown';
            }
        } else {
            command = 'select';
        }
        
        const target = this.buildLocator(dropdown);
        
        console.log('Recording dropdown selection:', command, target, value);
        this.sendCommand(command, target, value);
    }

    sendCommand(command, target, value) {
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
}

// Initialize the enhanced dropdown recorder
const enhancedDropdownRecorder = new EnhancedDropdownRecorder();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedDropdownRecorder;
}
