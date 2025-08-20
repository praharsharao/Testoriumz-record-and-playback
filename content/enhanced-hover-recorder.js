// Enhanced Hover Recorder
// This file provides advanced hover tracking with visual feedback and element collection

class EnhancedHoverRecorder {
    constructor() {
        this.isRecording = false;
        this.hoverBox = null;
        this.hoverTimeout = null;
        this.currentElement = null;
        this.hoverStartTime = null;
        this.isHoverActive = false;
        this.hoverDuration = 1500; // 1.5 seconds - reduced from 3 seconds for better UX
        this.originalOutline = null;
        this.isInitialized = false;
        this.recordingStateCheckInterval = null;
        this.debug = true; // Enable debug logging
        this.forceActivation = false; // For manual testing
        this.autoRecordOnGreen = true; // Automatically record when green state is reached
        this.recordedElements = new Set(); // Track which elements have been recorded
        this.lastHoverRecordTime = 0; // Track when last hover was recorded
        this.hoverClickCooldown = 2000; // 2 second cooldown to prevent click interference
        this.includeValidations = true; // Include validations in exported code
        this.includeScreenshots = true; // Include screenshots in exported code
        this.includeLogging = true; // Include logging in exported code
        this.includeIfElse = true; // Include if-else statements in exported code
        
        // Wait for neighbor XPath generator to be available
        this.waitForNeighborXPathGenerator();
    }

    log(message) {
        if (this.debug) {
            console.log('[EnhancedHoverRecorder]', message);
        }
    }

    waitForNeighborXPathGenerator() {
        // Check if neighbor XPath generator is already available
        if (window.neighborXpathsGenerator && typeof window.neighborXpathsGenerator.getXpathsByNeighbors === 'function') {
            this.log('Neighbor XPath generator is already available');
            return;
        }
        
        // Wait for neighbor XPath generator to be loaded
        this.log('Waiting for neighbor XPath generator to be available...');
        let attempts = 0;
        const maxAttempts = 50; // Wait up to 5 seconds
        
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.neighborXpathsGenerator && typeof window.neighborXpathsGenerator.getXpathsByNeighbors === 'function') {
                this.log('Neighbor XPath generator is now available');
                clearInterval(checkInterval);
            } else if (attempts >= maxAttempts) {
                this.log('Neighbor XPath generator not available after 5 seconds, continuing without enhanced XPath generation');
                clearInterval(checkInterval);
            }
        }, 100);
    }

    init() {
        if (this.isInitialized) {
            this.log('Already initialized');
            return;
        }
        
        this.log('Initializing enhanced hover recorder...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            this.log('DOM still loading, waiting for DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.log('DOM already ready, initializing immediately');
            this.initializeComponents();
        }
        
        this.isInitialized = true;
    }

    initializeComponents() {
        this.log('Initializing components...');
        this.createHoverBox();
        this.listenForRecordingState();
        this.attachHoverListeners();
        this.startRecordingStateCheck();
        this.ensureIntegration();
        this.addSettingsPanelToggle();
        this.log('Components initialized successfully');
    }
    
    addSettingsPanelToggle() {
        // Listen for keyboard shortcut to toggle settings panel
        document.addEventListener('keydown', (event) => {
            // Ctrl+Alt+S to toggle settings panel
            if (event.ctrlKey && event.altKey && event.key === 's') {
                this.toggleSettingsPanel();
                event.preventDefault();
            }
        });
        
        // Add settings button to the page
        const settingsButton = document.createElement('button');
        settingsButton.id = 'enhanced-hover-settings-toggle';
        settingsButton.innerHTML = '⚙️';
        settingsButton.title = 'TestoriumZ Export Settings (Ctrl+Alt+S)';
        settingsButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #4CAF50;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            z-index: 2147483646;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        settingsButton.addEventListener('click', () => {
            this.toggleSettingsPanel();
        });
        
        document.body.appendChild(settingsButton);
    }

    createHoverBox() {
        this.log('Creating hover box...');
        
        // Remove existing elements if they exist
        const existingBox = document.getElementById('enhanced-hover-box');
        const existingTooltip = document.getElementById('enhanced-hover-info');
        const existingSettings = document.getElementById('enhanced-hover-settings');
        
        if (existingBox) {
            existingBox.remove();
            this.log('Removed existing hover box');
        }
        if (existingTooltip) {
            existingTooltip.remove();
            this.log('Removed existing tooltip');
        }
        if (existingSettings) {
            existingSettings.remove();
            this.log('Removed existing settings panel');
        }

        // Create the hover box element
        this.hoverBox = document.createElement('div');
        this.hoverBox.id = 'enhanced-hover-box';
        this.hoverBox.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background-color: rgba(255, 0, 0, 0.3);
            border: 2px solid #ff0000;
            border-radius: 50%;
            pointer-events: none;
            z-index: 2147483647;
            display: none;
            transition: all 0.3s ease;
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
            position: fixed !important;
        `;
        
        // Create info tooltip
        this.infoTooltip = document.createElement('div');
        this.infoTooltip.id = 'enhanced-hover-info';
        this.infoTooltip.style.cssText = `
            position: fixed;
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
            word-wrap: break-word;
            pointer-events: none;
            z-index: 2147483647;
            display: none;
            white-space: pre-wrap;
            position: fixed !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        `;
        
        // Create settings panel
        this.createSettingsPanel();
        
        // Append to body with high priority
        if (document.body) {
            document.body.appendChild(this.hoverBox);
            document.body.appendChild(this.infoTooltip);
            document.body.appendChild(this.settingsPanel);
            this.log('Hover elements appended to body');
        } else {
            this.log('Body not ready, waiting for it...');
            // If body doesn't exist yet, wait for it
            const observer = new MutationObserver((mutations) => {
                if (document.body) {
                    document.body.appendChild(this.hoverBox);
                    document.body.appendChild(this.infoTooltip);
                    document.body.appendChild(this.settingsPanel);
                    observer.disconnect();
                    this.log('Hover elements appended to body (delayed)');
                }
            });
            observer.observe(document.documentElement, { childList: true });
        }
    }
    
    createSettingsPanel() {
        // Create settings panel
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.id = 'enhanced-hover-settings';
        this.settingsPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 10px;
            z-index: 2147483647;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
            font-size: 12px;
            width: 200px;
            display: none;
        `;
        
        // Create settings content
        this.settingsPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Export Settings</strong>
                <button id="enhanced-hover-settings-close" style="background: none; border: none; cursor: pointer; font-size: 16px;">×</button>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="enhanced-hover-validations" ${this.includeValidations ? 'checked' : ''}>
                    <span style="margin-left: 5px;">Include Validations</span>
                </label>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="enhanced-hover-screenshots" ${this.includeScreenshots ? 'checked' : ''}>
                    <span style="margin-left: 5px;">Capture Screenshots</span>
                </label>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="enhanced-hover-logging" ${this.includeLogging ? 'checked' : ''}>
                    <span style="margin-left: 5px;">Log to Console</span>
                </label>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center;">
                    <input type="checkbox" id="enhanced-hover-ifelse" ${this.includeIfElse ? 'checked' : ''}>
                    <span style="margin-left: 5px;">If-Else Statements</span>
                </label>
            </div>
            <div style="margin-top: 10px;">
                <button id="enhanced-hover-settings-save" style="background-color: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; width: 100%;">Save Settings</button>
            </div>
        `;
        
        // Add event listeners after the panel is added to the DOM
        setTimeout(() => {
            // Close button
            const closeButton = document.getElementById('enhanced-hover-settings-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.settingsPanel.style.display = 'none';
                });
            }
            
            // Save button
            const saveButton = document.getElementById('enhanced-hover-settings-save');
            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    this.saveSettings();
                });
            }
        }, 100);
    }
    
    saveSettings() {
        // Get settings values
        const validationsCheckbox = document.getElementById('enhanced-hover-validations');
        const screenshotsCheckbox = document.getElementById('enhanced-hover-screenshots');
        const loggingCheckbox = document.getElementById('enhanced-hover-logging');
        const ifelseCheckbox = document.getElementById('enhanced-hover-ifelse');
        
        if (validationsCheckbox && screenshotsCheckbox && loggingCheckbox && ifelseCheckbox) {
            this.includeValidations = validationsCheckbox.checked;
            this.includeScreenshots = screenshotsCheckbox.checked;
            this.includeLogging = loggingCheckbox.checked;
            this.includeIfElse = ifelseCheckbox.checked;
            
            this.log('Settings saved:');
            this.log(`- Include Validations: ${this.includeValidations}`);
            this.log(`- Include Screenshots: ${this.includeScreenshots}`);
            this.log(`- Include Logging: ${this.includeLogging}`);
            this.log(`- Include If-Else: ${this.includeIfElse}`);
            
            // Hide settings panel
            this.settingsPanel.style.display = 'none';
            
            // Show confirmation
            this.showSettingsSavedConfirmation();
        }
    }
    
    showSettingsSavedConfirmation() {
        // Create a temporary confirmation element
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 2147483647;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        confirmation.innerHTML = `
            <strong>✅ Settings Saved!</strong><br>
            <small>Your export preferences have been updated.</small>
        `;
        
        document.body.appendChild(confirmation);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (confirmation.parentNode) {
                confirmation.parentNode.removeChild(confirmation);
            }
        }, 3000);
    }
    
    // Add method to toggle settings panel visibility
    toggleSettingsPanel() {
        if (this.settingsPanel) {
            if (this.settingsPanel.style.display === 'none') {
                this.settingsPanel.style.display = 'block';
            } else {
                this.settingsPanel.style.display = 'none';
            }
        }
    }

    startRecordingStateCheck() {
        this.log('Starting recording state check...');
        // Check recording state periodically to ensure it's properly synchronized
        this.recordingStateCheckInterval = setInterval(() => {
            // Multiple ways to detect recording state
            let shouldBeRecording = false;
            
            // Method 1: Check window.recorder
            if (typeof window !== 'undefined' && window.recorder) {
                shouldBeRecording = window.recorder.attached;
                this.log(`Window recorder state: ${shouldBeRecording}`);
            }
            
            // Method 2: Check for recording banner with more comprehensive selectors
            const recordingBanner = document.querySelector('[style*="Testoriumz Recorder is recording"]') || 
                                   document.querySelector('[style*="recording"]') ||
                                   document.querySelector('[id*="recording"]') ||
                                   document.querySelector('[class*="recording"]') ||
                                   document.querySelector('[data-testid*="recording"]') ||
                                   document.querySelector('[aria-label*="recording"]') ||
                                   document.querySelector('[title*="recording"]') ||
                                   document.querySelector('*:contains("Testoriumz Recorder is recording")');
            if (recordingBanner) {
                shouldBeRecording = true;
                this.log('Found recording banner, setting recording to true');
            }
            
            // Method 3: Check for recording-related text in positioned elements
            const recordingTexts = [
                'Testoriumz Recorder is recording',
                'recording',
                'Recording',
                'RECORDING',
                'Testoriumz',
                'Recorder'
            ];
            
            for (let text of recordingTexts) {
                const elements = document.querySelectorAll('*');
                for (let element of elements) {
                    if (element.textContent && element.textContent.includes(text)) {
                        // Additional check to ensure it's actually a recording indicator
                        const style = window.getComputedStyle(element);
                        if (style.position === 'fixed' || style.position === 'absolute' || 
                            element.style.position === 'fixed' || element.style.position === 'absolute') {
                            shouldBeRecording = true;
                            this.log(`Found recording text "${text}" in positioned element, setting recording to true`);
                            break;
                        }
                    }
                }
                if (shouldBeRecording) break;
            }
            
            // Method 4: Check for force activation
            if (this.forceActivation) {
                shouldBeRecording = true;
                this.log('Force activation enabled');
            }
            
            // Method 5: Check for recording-related CSS classes or IDs in positioned elements
            const recordingSelectors = [
                '[class*="recording"]',
                '[id*="recording"]',
                '[class*="testoriumz"]',
                '[id*="testoriumz"]',
                '[class*="recorder"]',
                '[id*="recorder"]'
            ];
            
            for (let selector of recordingSelectors) {
                const elements = document.querySelectorAll(selector);
                for (let element of elements) {
                    const style = window.getComputedStyle(element);
                    if (style.position === 'fixed' || style.position === 'absolute' || 
                        element.style.position === 'fixed' || element.style.position === 'absolute') {
                        shouldBeRecording = true;
                        this.log(`Found recording element with selector "${selector}", setting recording to true`);
                        break;
                    }
                }
                if (shouldBeRecording) break;
            }
            
            // Update recording state if changed
            if (shouldBeRecording !== this.isRecording) {
                this.log(`Recording state changed: ${this.isRecording} -> ${shouldBeRecording}`);
                this.isRecording = shouldBeRecording;
                if (!shouldBeRecording) {
                    this.clearHover();
                } else {
                    this.log('Recording started - hover recorder is now active!');
                }
            }
        }, 500); // Check more frequently
    }

    listenForRecordingState() {
        this.log('Setting up recording state listeners...');
        
        // Listen for messages from the background script
        if (typeof browser !== 'undefined' && browser.runtime) {
            browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.attachRecorder) {
                    this.log('Received attachRecorder message');
                    this.isRecording = true;
                } else if (message.detachRecorder) {
                    this.log('Received detachRecorder message');
                    this.isRecording = false;
                    this.clearHover();
                } else if (message.success && message.message) {
                    // Handle confirmation from background recorder
                    this.log('Received confirmation from background recorder:', message.message);
                    if (message.message.includes('Hover-triggered click action recorded successfully') || 
                        message.message.includes('Hover action recorded successfully')) {
                        this.log('✅ Click action confirmed as recorded in test case');
                        this.updateTooltipText('✅ Click Step Added to Test Case!');
                    }
                }
            });
        }

        // Also listen for custom events
        document.addEventListener('recordingStarted', () => {
            this.log('Received recordingStarted event');
            this.isRecording = true;
        });

        document.addEventListener('recordingStopped', () => {
            this.log('Received recordingStopped event');
            this.isRecording = false;
            this.clearHover();
        });

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.log('Page hidden, clearing hover');
                this.clearHover();
            }
        });
        
        // Listen for DOM changes that might indicate recording started
        const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for various recording indicators
                            const recordingTexts = [
                                'Testoriumz Recorder is recording',
                                'recording',
                                'Recording',
                                'RECORDING',
                                'Testoriumz',
                                'Recorder'
                            ];
                            
                            for (let text of recordingTexts) {
                                if (node.textContent && node.textContent.includes(text)) {
                                    // Additional check to ensure it's actually a recording indicator
                                    const style = window.getComputedStyle(node);
                                    if (style.position === 'fixed' || style.position === 'absolute' || 
                                        node.style.position === 'fixed' || node.style.position === 'absolute') {
                                        this.log(`Detected recording banner in DOM changes: "${text}"`);
                                        this.isRecording = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });
        
        // Additional check: Listen for iframe messages that might indicate recording
        window.addEventListener('message', (event) => {
            if (event.data && typeof event.data === 'object') {
                if (event.data.type === 'recordingStarted' || 
                    event.data.command === 'attachRecorder' ||
                    event.data.recording === true) {
                    this.log('Received recording message from iframe or parent');
                    this.isRecording = true;
                } else if (event.data.type === 'recordingStopped' || 
                          event.data.command === 'detachRecorder' ||
                          event.data.recording === false) {
                    this.log('Received stop recording message from iframe or parent');
                    this.isRecording = false;
                    this.clearHover();
                }
            }
        });
    }

    attachHoverListeners() {
        this.log('Attaching hover listeners...');
        
        // Use capture phase to ensure we get events before page handlers
        document.addEventListener('mousemove', (event) => {
            if (!this.isRecording && !this.forceActivation) return;
            
            this.updateHoverBoxPosition(event.clientX, event.clientY);
        }, true);

        document.addEventListener('mouseover', (event) => {
            if (!this.isRecording && !this.forceActivation) return;
            
            this.handleElementHover(event);
        }, true);

        document.addEventListener('mouseout', (event) => {
            if (!this.isRecording && !this.forceActivation) return;
            
            this.handleElementLeave(event);
        }, true);

        // Keep click listener for manual recording if needed
        document.addEventListener('click', (event) => {
            if ((!this.isRecording && !this.forceActivation) || !this.isHoverActive) return;
            
            // Check if we recently recorded a hover action to prevent interference
            const timeSinceLastHover = Date.now() - this.lastHoverRecordTime;
            if (timeSinceLastHover < this.hoverClickCooldown) {
                this.log(`Click event ignored - too soon after hover recording (${timeSinceLastHover}ms < ${this.hoverClickCooldown}ms)`);
                return;
            }
            
            // Only record if auto-record is disabled or element hasn't been recorded yet
            if (!this.autoRecordOnGreen || !this.recordedElements.has(this.currentElement)) {
                this.recordHoverAction(event);
            }
        }, true);

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        this.log('Hover listeners attached');
    }

    updateHoverBoxPosition(x, y) {
        if (this.hoverBox) {
            this.hoverBox.style.left = (x - 10) + 'px';
            this.hoverBox.style.top = (y - 10) + 'px';
            this.hoverBox.style.display = 'block';
        }
    }

    handleElementHover(event) {
        const element = event.target;
        
        // Skip if hovering over our own elements or body/html
        if (element.id === 'enhanced-hover-box' || 
            element.id === 'enhanced-hover-info' ||
            element === document.body ||
            element === document.documentElement) {
            return;
        }

        this.log(`Hovering over element: ${element.tagName}${element.id ? '#' + element.id : ''}`);

        // Clear previous hover
        this.clearHover();

        // Set new hover element
        this.currentElement = element;
        this.hoverStartTime = Date.now();
        this.isHoverActive = true;

        // Store original outline
        this.originalOutline = element.style.outline;

        // Apply initial hover style with !important to override page styles
        element.style.setProperty('outline', '2px solid #ff0000', 'important');
        element.style.setProperty('outline-offset', '2px', 'important');

        // Start hover timer
        this.hoverTimeout = setTimeout(() => {
            this.onHoverTimeout();
        }, this.hoverDuration);

        // Show info tooltip
        this.showElementInfo(element, event.clientX, event.clientY);
    }

    handleElementLeave(event) {
        const element = event.target;
        
        // Only clear if leaving the current hover element
        if (element === this.currentElement) {
            this.log('Leaving hovered element');
            this.clearHover();
        }
    }

    onHoverTimeout() {
        if (this.currentElement && this.isHoverActive) {
            this.log('Hover timeout reached, changing to green');
            // Change color to indicate hover is active
            this.currentElement.style.setProperty('outline', '2px solid #00ff00', 'important');
            this.hoverBox.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            this.hoverBox.style.borderColor = '#00ff00';
            this.hoverBox.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
            
            // Update tooltip to show hover is active and will record as click
            this.updateTooltipText('Hover Active - Will record as click action');
            
            // Automatically record the hover action when green state is reached
            if (this.autoRecordOnGreen && !this.recordedElements.has(this.currentElement)) {
                this.log('Auto-recording hover action for green state');
                
                // Temporarily prevent existing click handlers from interfering
                this.preventClickInterference();
                
                this.recordHoverAction(null); // Pass null since no click event
                
                // Keep the green outline locked (don't clear hover)
                // The outline will stay green until user moves to another element
            }
        }
    }

    preventClickInterference() {
        // Add a temporary flag to prevent existing click handlers
        if (window.recorder && window.recorder.attached) {
            // Set a flag to prevent click recording for a short time
            window.preventClickRecording = true;
            setTimeout(() => {
                window.preventClickRecording = false;
            }, 1000); // Prevent clicks for 1 second after hover recording
        }
    }

    clearHover() {
        // Clear timeout
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }

        // Restore original outline
        if (this.currentElement && this.originalOutline !== null) {
            if (this.originalOutline === '') {
                this.currentElement.style.removeProperty('outline');
                this.currentElement.style.removeProperty('outline-offset');
            } else {
                this.currentElement.style.setProperty('outline', this.originalOutline, 'important');
                this.currentElement.style.removeProperty('outline-offset');
            }
        }

        // Reset hover box
        if (this.hoverBox) {
            this.hoverBox.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            this.hoverBox.style.borderColor = '#ff0000';
            this.hoverBox.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        }

        // Hide tooltip
        if (this.infoTooltip) {
            this.infoTooltip.style.display = 'none';
        }

        // Reset state
        this.currentElement = null;
        this.hoverStartTime = null;
        this.isHoverActive = false;
        this.originalOutline = null;
    }

    showElementInfo(element, x, y) {
        if (!this.infoTooltip) return;

        const elementInfo = this.getElementInfo(element);
        this.infoTooltip.innerHTML = elementInfo;
        
        // Position tooltip near cursor but ensure it's visible
        const tooltipWidth = 300;
        const tooltipHeight = 100;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let tooltipX = x + 20;
        let tooltipY = y - 20;
        
        // Adjust if tooltip would go off screen
        if (tooltipX + tooltipWidth > windowWidth) {
            tooltipX = x - tooltipWidth - 20;
        }
        if (tooltipY + tooltipHeight > windowHeight) {
            tooltipY = y - tooltipHeight;
        }
        
        this.infoTooltip.style.left = tooltipX + 'px';
        this.infoTooltip.style.top = tooltipY + 'px';
        this.infoTooltip.style.display = 'block';
    }

    updateTooltipText(text) {
        if (this.infoTooltip) {
            this.infoTooltip.innerHTML = text;
        }
    }

    getElementInfo(element) {
        if (!element) return 'No element';

        const tagName = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
        const text = element.textContent ? element.textContent.substring(0, 50) : '';
        
        let info = `Tag: ${tagName}${id}${className}\n`;
        info += `Text: ${text}\n`;
        
        // Add more element details
        if (element.type) info += `Type: ${element.type}\n`;
        if (element.name) info += `Name: ${element.name}\n`;
        if (element.value) info += `Value: ${element.value}\n`;
        if (element.href) info += `Href: ${element.href}\n`;
        if (element.src) info += `Src: ${element.src}\n`;
        
        return info;
    }

    recordHoverAction(event) {
        if (!this.currentElement || !this.isHoverActive) return;

        const hoverDuration = Date.now() - this.hoverStartTime;
        
        this.log(`Recording hover action for element: ${this.currentElement.tagName}${this.currentElement.id ? '#' + this.currentElement.id : ''}`);
        
        // Create hover action data - record as click action for better test automation
        const actionData = {
            actionName: 'Click Element', // Change from 'hover' to 'Click Element' for better test automation
            element: this.currentElement,
            duration: hoverDuration,
            timestamp: Date.now(),
            elementInfo: this.getElementInfo(this.currentElement),
            xpath: this.getXPath(this.currentElement),
            enhancedXPath: this.getEnhancedXPath(this.currentElement),
            isHoverTriggered: true, // Flag to indicate this was triggered by hover
            includeValidations: this.includeValidations,
            includeScreenshots: this.includeScreenshots,
            includeLogging: this.includeLogging,
            includeIfElse: this.includeIfElse
        };

        // Send to recorder
        this.sendHoverAction(actionData);
        
        // Mark this element as recorded and track time
        this.recordedElements.add(this.currentElement);
        this.lastHoverRecordTime = Date.now();
        
        // Don't clear hover - keep the green outline locked
        // Only clear timeout to prevent multiple recordings
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
    }

    getXPath(element) {
        if (!element) return '';
        
        // Fallback to basic XPath generation
        if (element.id) {
            return `//*[@id="${element.id}"]`;
        }
        
        if (element === document.body) {
            return '/html/body';
        }
        
        let path = '';
        while (element && element.nodeType === Node.ELEMENT_NODE) {
            let index = 1;
            let sibling = element.previousSibling;
            
            while (sibling) {
                if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
                    index++;
                }
                sibling = sibling.previousSibling;
            }
            
            const tagName = element.tagName.toLowerCase();
            const pathIndex = (index > 1 ? `[${index}]` : '');
            path = '/' + tagName + pathIndex + path;
            
            element = element.parentNode;
        }
        
        return path;
    }

    getEnhancedXPath(element) {
        if (!element) return '';
        
        this.log(`Getting enhanced XPath for element: ${element.tagName}${element.id ? '#' + element.id : ''}`);
        
        // Use enhanced XPath generation with neighbor information if available
        if (window.neighborXpathsGenerator && typeof window.neighborXpathsGenerator.getXpathsByNeighbors === 'function') {
            try {
                this.log('Neighbor XPath generator is available, generating enhanced XPath...');
                const enhancedXPaths = window.neighborXpathsGenerator.getXpathsByNeighbors(element, false);
                this.log('Enhanced XPaths generated:', enhancedXPaths);
                
                if (enhancedXPaths && enhancedXPaths.length > 0) {
                    // Return the first enhanced XPath (most reliable)
                    this.log(`Using enhanced XPath: ${enhancedXPaths[0]}`);
                    return enhancedXPaths[0];
                } else {
                    this.log('No enhanced XPaths generated, falling back to basic XPath');
                }
            } catch (error) {
                this.log(`Enhanced XPath generation failed: ${error}, falling back to basic XPath`);
            }
        } else {
            this.log('Neighbor XPath generator not available, using basic XPath');
        }
        
        // Fallback to basic XPath
        const basicXPath = this.getXPath(element);
        this.log(`Using basic XPath: ${basicXPath}`);
        return basicXPath;
    }

    sendHoverAction(actionData) {
        this.log('Sending hover action to recorder');
        this.log('Action data:', JSON.stringify(actionData, null, 2));
        
        // Use enhanced XPath as primary target, fallback to basic XPath
        const primaryXPath = actionData.enhancedXPath || actionData.xpath;
        
        this.log(`Using primary XPath: ${primaryXPath}`);
        this.log(`Enhanced XPath available: ${!!actionData.enhancedXPath}`);
        this.log(`Basic XPath: ${actionData.xpath}`);
        
        // Create value string with enhanced information
        let clickValue = actionData.elementInfo || '';
        if (actionData.duration) {
            clickValue += ` (Hover Duration: ${actionData.duration}ms)`;
        }
        if (actionData.element.tagName) {
            clickValue += ` | Tag: ${actionData.element.tagName}`;
        }
        if (actionData.element.textContent) {
            clickValue += ` | Text: "${actionData.element.textContent.substring(0, 50)}"`;
        }
        if (actionData.element.id) {
            clickValue += ` | ID: ${actionData.element.id}`;
        }
        if (actionData.enhancedXPath && actionData.enhancedXPath !== actionData.xpath) {
            clickValue += ` | Enhanced XPath: ${actionData.enhancedXPath}`;
        }
        
        // Add export options
        clickValue += ` | Validations: ${actionData.includeValidations ? 'Yes' : 'No'}`;
        clickValue += ` | Screenshots: ${actionData.includeScreenshots ? 'Yes' : 'No'}`;
        clickValue += ` | Logging: ${actionData.includeLogging ? 'Yes' : 'No'}`;
        clickValue += ` | IfElse: ${actionData.includeIfElse ? 'Yes' : 'No'}`;
        
        this.log('Click value:', clickValue);
        
        // ALWAYS use direct message sending to ensure it works
        this.sendDirectMessage(primaryXPath, clickValue, actionData);

        // Also dispatch custom event for other listeners
        const customEvent = new CustomEvent('hoverActionRecorded', {
            detail: actionData
        });
        document.dispatchEvent(customEvent);
        
        this.log('Hover action recorded successfully: ' + JSON.stringify(actionData, null, 2));
        
        // Additional confirmation - try to notify the user
        this.showRecordingConfirmation(actionData);
    }

    sendDirectMessage(primaryXPath, clickValue, actionData) {
        this.log('Sending direct message to background recorder');
        
        // Try multiple methods to send the message
        let messageSent = false;
        
        // Method 0: Try main recorder if available
        if (window.recorder && typeof window.recorder.record === 'function' && window.recorder.attached) {
            this.log('Trying main recorder.record method...');
            try {
                // Include export options in the message
                const enhancedCommand = {
                    command: 'Click Element',
                    target: [[primaryXPath]],
                    value: clickValue,
                    includeValidations: actionData.includeValidations,
                    includeScreenshots: actionData.includeScreenshots,
                    includeLogging: actionData.includeLogging,
                    includeIfElse: actionData.includeIfElse
                };
                
                window.recorder.record('Click Element', [[primaryXPath]], clickValue, enhancedCommand);
                this.log('✅ Main recorder.record() successful');
                this.updateTooltipText('✅ Click Step Added to Test Case!');
                setTimeout(() => {
                    if (this.infoTooltip) {
                        this.infoTooltip.style.display = 'none';
                    }
                }, 2000);
                return;
            } catch (error) {
                this.log('❌ Main recorder.record() failed: ' + error);
            }
        }
        
        // Method 1: Try browser.runtime.sendMessage
        if (typeof browser !== 'undefined' && browser.runtime) {
            this.log('Trying browser.runtime.sendMessage...');
            
            const message = {
                command: 'Click Element',
                target: [[primaryXPath]],
                value: clickValue,
                insertBeforeLastCommand: false,
                frameLocation: this.getFrameLocation(),
                includeValidations: actionData.includeValidations,
                includeScreenshots: actionData.includeScreenshots,
                includeLogging: actionData.includeLogging,
                includeIfElse: actionData.includeIfElse
            };
            
            this.log('Sending message in main recorder format:', JSON.stringify(message, null, 2));
            
            browser.runtime.sendMessage(message)
                .then(response => {
                    this.log('✅ Hover action successfully sent to recorder. Response:', response);
                    this.updateTooltipText('✅ Click Step Added to Test Case!');
                    messageSent = true;
                    setTimeout(() => {
                        if (this.infoTooltip) {
                            this.infoTooltip.style.display = 'none';
                        }
                    }, 2000);
                })
                .catch(error => {
                    this.log('❌ browser.runtime.sendMessage failed: ' + error);
                    this.tryAlternativeMethods(primaryXPath, clickValue, actionData);
                });
        } else {
            this.log('Browser runtime not available, trying alternative methods');
            this.tryAlternativeMethods(primaryXPath, clickValue, actionData);
        }
    }

    tryAlternativeMethods(primaryXPath, clickValue, actionData) {
        this.log('Trying alternative methods to send message...');
        
        // Method 2: Try chrome.runtime.sendMessage (for Chrome)
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            this.log('Trying chrome.runtime.sendMessage...');
            
            const message = {
                command: 'Click Element',
                target: [[primaryXPath]],
                value: clickValue,
                insertBeforeLastCommand: false,
                frameLocation: this.getFrameLocation(),
                includeValidations: actionData.includeValidations,
                includeScreenshots: actionData.includeScreenshots,
                includeLogging: actionData.includeLogging,
                includeIfElse: actionData.includeIfElse
            };
            
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    this.log('❌ chrome.runtime.sendMessage failed: ' + chrome.runtime.lastError.message);
                    this.tryMethod3(primaryXPath, clickValue, actionData);
                } else {
                    this.log('✅ Hover action successfully sent via chrome.runtime. Response:', response);
                    this.updateTooltipText('✅ Click Step Added to Test Case!');
                    setTimeout(() => {
                        if (this.infoTooltip) {
                            this.infoTooltip.style.display = 'none';
                        }
                    }, 2000);
                }
            });
        } else {
            this.log('Chrome runtime not available, trying method 3');
            this.tryMethod3(primaryXPath, clickValue, actionData);
        }
    }

    tryMethod3(primaryXPath, clickValue, actionData) {
        this.log('Trying method 3: Direct DOM manipulation...');
        
        // Method 3: Try to trigger a click event that the main recorder will catch
        if (this.currentElement) {
            this.log('Triggering click event on current element...');
            
            // Create and dispatch a click event
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: this.currentElement.getBoundingClientRect().left + 5,
                clientY: this.currentElement.getBoundingClientRect().top + 5
            });
            
            // Add a flag to indicate this is from hover recorder
            clickEvent.hoverTriggered = true;
            clickEvent.hoverDuration = actionData.duration;
            clickEvent.enhancedXPath = actionData.enhancedXPath;
            clickEvent.includeValidations = actionData.includeValidations;
            clickEvent.includeScreenshots = actionData.includeScreenshots;
            clickEvent.includeLogging = actionData.includeLogging;
            clickEvent.includeIfElse = actionData.includeIfElse;
            
            this.currentElement.dispatchEvent(clickEvent);
            
            this.log('✅ Click event dispatched successfully');
            this.updateTooltipText('✅ Click Step Added to Test Case!');
            setTimeout(() => {
                if (this.infoTooltip) {
                    this.infoTooltip.style.display = 'none';
                }
            }, 2000);
        } else {
            this.log('❌ No current element to trigger click on');
            this.tryMethod4(primaryXPath, clickValue, actionData);
        }
    }

    tryMethod4(primaryXPath, clickValue, actionData) {
        this.log('Trying method 4: Direct DOM manipulation of test case...');
        
        // Method 4: Try to directly add the command to the test case by finding the records grid
        const recordsGrid = document.getElementById('records-grid');
        if (recordsGrid) {
            this.log('Found records-grid, attempting to add command directly...');
            
            // Create a new record row
            const newRecord = document.createElement('div');
            newRecord.className = 'record';
            newRecord.style.cssText = `
                display: flex;
                border-bottom: 1px solid #ddd;
                padding: 8px;
                background: #f8f9fa;
            `;
            
            // Create command cell
            const commandCell = document.createElement('div');
            commandCell.style.cssText = 'flex: 1; padding: 4px; font-weight: bold;';
            commandCell.textContent = 'Click Element';
            
            // Create target cell
            const targetCell = document.createElement('div');
            targetCell.style.cssText = 'flex: 2; padding: 4px; font-family: monospace; font-size: 12px;';
            targetCell.textContent = primaryXPath;
            
            // Create value cell
            const valueCell = document.createElement('div');
            valueCell.style.cssText = 'flex: 1; padding: 4px; font-size: 12px; color: #666;';
            valueCell.textContent = clickValue;
            
            // Add cells to record
            newRecord.appendChild(commandCell);
            newRecord.appendChild(targetCell);
            newRecord.appendChild(valueCell);
            
            // Add to records grid
            recordsGrid.appendChild(newRecord);
            
            this.log('✅ Command added directly to test case');
            this.updateTooltipText('✅ Click Step Added to Test Case!');
            setTimeout(() => {
                if (this.infoTooltip) {
                    this.infoTooltip.style.display = 'none';
                }
            }, 2000);
        } else {
            this.log('❌ Records grid not found');
            this.updateTooltipText('❌ Cannot add to test case');
        }
    }

    showRecordingConfirmation(actionData) {
        // Create a temporary confirmation element
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 2147483647;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        confirmation.innerHTML = `
            <strong>✅ Hover Action Recorded!</strong><br>
            <small>Element: ${actionData.element.tagName}${actionData.element.id ? '#' + actionData.element.id : ''}</small>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(confirmation);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (confirmation.parentNode) {
                confirmation.parentNode.removeChild(confirmation);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 3000);
    }

    getFrameLocation() {
        // Get frame location like the existing KURecorder
        let path = [];
        let currentWindow = window;
        
        while (currentWindow !== currentWindow.parent) {
            let frameIndex = 0;
            let frames = currentWindow.parent.document.getElementsByTagName('iframe');
            for (let i = 0; i < frames.length; i++) {
                if (frames[i].contentWindow === currentWindow) {
                    frameIndex = i;
                    break;
                }
            }
            path.unshift(frameIndex);
            currentWindow = currentWindow.parent;
        }
        
        const frameLocation = ["root", ...path].join(":");
        return frameLocation;
    }

    cleanup() {
        this.log('Cleaning up...');
        this.clearHover();
        
        if (this.recordingStateCheckInterval) {
            clearInterval(this.recordingStateCheckInterval);
            this.recordingStateCheckInterval = null;
        }
        
        if (this.hoverBox && this.hoverBox.parentNode) {
            this.hoverBox.parentNode.removeChild(this.hoverBox);
        }
        
        if (this.infoTooltip && this.infoTooltip.parentNode) {
            this.infoTooltip.parentNode.removeChild(this.infoTooltip);
        }
        
        if (this.settingsPanel && this.settingsPanel.parentNode) {
            this.settingsPanel.parentNode.removeChild(this.settingsPanel);
        }
        
        const settingsButton = document.getElementById('enhanced-hover-settings-toggle');
        if (settingsButton && settingsButton.parentNode) {
            settingsButton.parentNode.removeChild(settingsButton);
        }
    }

    destroy() {
        this.cleanup();
        this.isInitialized = false;
    }

    // Manual activation for testing
    activate() {
        this.log('Manually activating hover recorder');
        this.isRecording = true;
        this.forceActivation = true;
    }

    deactivate() {
        this.log('Manually deactivating hover recorder');
        this.isRecording = false;
        this.forceActivation = false;
        this.clearHover();
    }

    // Method to ensure proper integration with main recorder
    ensureIntegration() {
        this.log('Ensuring integration with main recorder system...');
        
        // Check if main recorder exists and is attached
        if (window.recorder && window.recorder.attached) {
            this.log('Main recorder is attached, activating hover recorder');
            this.log('Recorder object:', window.recorder);
            this.log('Recorder.record method:', typeof window.recorder.record);
            this.isRecording = true;
        } else {
            this.log('Main recorder not available or not attached');
            this.log('Window.recorder:', window.recorder);
            if (window.recorder) {
                this.log('Recorder.attached:', window.recorder.attached);
            }
            this.isRecording = false;
        }
        
        // Send a message to the background to confirm hover recorder is ready
        if (typeof browser !== 'undefined' && browser.runtime) {
            browser.runtime.sendMessage({
                type: 'hoverRecorderReady',
                isReady: true,
                hasEnhancedXPath: !!window.neighborXpathsGenerator
            }).catch(error => {
                this.log('Failed to send ready message: ' + error);
            });
        }
        
        // Dispatch event to notify other components
        document.dispatchEvent(new CustomEvent('hoverRecorderReady', {
            detail: {
                isReady: true,
                hasEnhancedXPath: !!window.neighborXpathsGenerator
            }
        }));
    }

    // Test method to check if everything is working
    test() {
        this.log('Running hover recorder test...');
        this.log('Initialized:', this.isInitialized);
        this.log('Recording:', this.isRecording);
        this.log('Force activation:', this.forceActivation);
        this.log('Auto record on green:', this.autoRecordOnGreen);
        this.log('Hover box exists:', !!this.hoverBox);
        this.log('Info tooltip exists:', !!this.infoTooltip);
        
        // Test hover box visibility
        if (this.hoverBox) {
            this.hoverBox.style.display = 'block';
            this.hoverBox.style.left = '100px';
            this.hoverBox.style.top = '100px';
            setTimeout(() => {
                this.hoverBox.style.display = 'none';
                this.log('Hover box test completed');
            }, 2000);
        }
        
        // Test recording detection
        this.log('Testing recording detection methods...');
        this.log('Window recorder exists:', !!window.recorder);
        if (window.recorder) {
            this.log('Window recorder attached:', window.recorder.attached);
        }
        
        // Check for recording banner
        const recordingBanner = document.querySelector('[style*="Testoriumz Recorder is recording"]') || 
                               document.querySelector('[style*="recording"]');
        this.log('Recording banner found:', !!recordingBanner);
        
        // Test enhanced XPath generation
        this.log('Testing enhanced XPath generation...');
        if (window.neighborXpathsGenerator && typeof window.neighborXpathsGenerator.getXpathsByNeighbors === 'function') {
            this.log('Enhanced XPath generator is available');
            
            // Test with a sample element
            const testElement = document.body || document.documentElement;
            try {
                const enhancedXPaths = window.neighborXpathsGenerator.getXpathsByNeighbors(testElement, false);
                this.log('Enhanced XPath generation test successful:', enhancedXPaths.length > 0);
                if (enhancedXPaths.length > 0) {
                    this.log('Sample enhanced XPath:', enhancedXPaths[0]);
                }
            } catch (error) {
                this.log('Enhanced XPath generation test failed:', error);
            }
        } else {
            this.log('Enhanced XPath generator not available');
        }
        
        // Test integration with main recorder
        this.log('Testing integration with main recorder...');
        this.ensureIntegration();
    }

    // Test enhanced XPath generation for a specific element
    testEnhancedXPathForElement(element) {
        this.log(`Testing enhanced XPath generation for element: ${element.tagName}${element.id ? '#' + element.id : ''}`);
        
        if (!element) {
            this.log('No element provided for testing');
            return;
        }
        
        // Test basic XPath
        const basicXPath = this.getXPath(element);
        this.log(`Basic XPath: ${basicXPath}`);
        
        // Test enhanced XPath
        const enhancedXPath = this.getEnhancedXPath(element);
        this.log(`Enhanced XPath: ${enhancedXPath}`);
        
        // Test recording integration
        this.log('Testing recording integration...');
        if (window.recorder && typeof window.recorder.record === 'function') {
            this.log('Attempting to record a test command...');
            try {
                window.recorder.record('Click Element', [[enhancedXPath || basicXPath]], 'Test command from hover recorder');
                this.log('✅ Test command recorded successfully via main recorder');
            } catch (error) {
                this.log('❌ Failed to record test command:', error);
            }
        } else {
            this.log('❌ Main recorder not available for test');
        }
        
        // Test neighbor XPath generator directly
        if (window.neighborXpathsGenerator && typeof window.neighborXpathsGenerator.getXpathsByNeighbors === 'function') {
            try {
                const enhancedXPaths = window.neighborXpathsGenerator.getXpathsByNeighbors(element, false);
                this.log('All enhanced XPaths generated:', enhancedXPaths);
                
                if (enhancedXPaths && enhancedXPaths.length > 0) {
                    this.log('Enhanced XPath generation successful');
                    enhancedXPaths.forEach((xpath, index) => {
                        this.log(`Enhanced XPath ${index + 1}: ${xpath}`);
                    });
                } else {
                    this.log('No enhanced XPaths generated');
                }
            } catch (error) {
                this.log('Enhanced XPath generation failed:', error);
            }
        } else {
            this.log('Neighbor XPath generator not available');
        }
        
        return {
            basicXPath,
            enhancedXPath,
            element: element
        };
    }
}

// Initialize the enhanced hover recorder immediately
const enhancedHoverRecorder = new EnhancedHoverRecorder();
enhancedHoverRecorder.init();

// Make it globally available
if (typeof window !== 'undefined') {
    window.enhancedHoverRecorder = enhancedHoverRecorder;
    
    // Add global test function for enhanced XPath
    window.testEnhancedXPathForElement = function(element) {
        if (window.enhancedHoverRecorder) {
            return window.enhancedHoverRecorder.testEnhancedXPathForElement(element);
        } else {
            console.log('Enhanced hover recorder not available');
            return null;
        }
    };
    
    // Add global test function for current hovered element
    window.testCurrentHoveredElement = function() {
        if (window.enhancedHoverRecorder && window.enhancedHoverRecorder.currentElement) {
            return window.enhancedHoverRecorder.testEnhancedXPathForElement(window.enhancedHoverRecorder.currentElement);
        } else {
            console.log('No current hovered element');
            return null;
        }
    };
    
    // Add global function to toggle settings panel
    window.toggleTestoriumZExportSettings = function() {
        if (window.enhancedHoverRecorder) {
            window.enhancedHoverRecorder.toggleSettingsPanel();
            return true;
        } else {
            console.log('Enhanced hover recorder not available');
            return false;
        }
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedHoverRecorder;
}
