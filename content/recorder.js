/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

// recorder entry

class Recorder {

    constructor(window) {
        this.window = window;
        this.attached = false;
        this.locatorBuilders = new LocatorBuilders(window);
        this.frameLocation = this.getFrameLocation();
        browser.runtime.sendMessage({
            frameLocation: this.frameLocation
        }).catch(function (reason) {
            // Failed silently if receiving end does not exist
        });
    }

    // This part of code is copyright by Software Freedom Conservancy(SFC)
    parseEventKey(eventKey) {
        if (eventKey.match(/^C_/)) {
            return { eventName: eventKey.substring(2), capture: true };
        } else {
            return { eventName: eventKey, capture: false };
        }
    }

    // This part of code is copyright by Software Freedom Conservancy(SFC)
    attach() {
        if (this.attached) {
            return;
        }
        this.attached = true;
        this.eventListeners = {};
        var self = this;
        for (let eventKey in Recorder.eventHandlers) {
            var eventInfo = this.parseEventKey(eventKey);
            var eventName = eventInfo.eventName;
            var capture = eventInfo.capture;
            // create new function so that the variables have new scope.
            function register() {
                var handlers = Recorder.eventHandlers[eventKey];
                var listener = function (event) {
                    for (var i = 0; i < handlers.length; i++) {
                        handlers[i].call(self, event);
                    }
                }
                this.window.document.addEventListener(eventName, listener, capture);
                this.eventListeners[eventKey] = listener;
            }
            register.call(this);
        }
        
        // Dispatch custom event to notify enhanced dropdown recorder
        if (typeof window !== 'undefined' && window.document) {
            window.document.dispatchEvent(new CustomEvent('recordingStarted'));
        }
        
        // Initialize enhanced hover recorder if available
        if (typeof window !== 'undefined' && window.enhancedHoverRecorder) {
            window.enhancedHoverRecorder.isRecording = true;
            console.log('Enhanced hover recorder activated');
        } else {
            console.log('Enhanced hover recorder not available yet');
        }
    }

    // This part of code is copyright by Software Freedom Conservancy(SFC)
    detach() {
        if (!this.attached) {
            return;
        }
        this.attached = false;
        for (let eventKey in this.eventListeners) {
            var eventInfo = this.parseEventKey(eventKey);
            var eventName = eventInfo.eventName;
            var capture = eventInfo.capture;
            this.window.document.removeEventListener(eventName, this.eventListeners[eventKey], capture);
        }
        delete this.eventListeners;
        
        // Dispatch custom event to notify enhanced dropdown recorder
        if (typeof window !== 'undefined' && window.document) {
            window.document.dispatchEvent(new CustomEvent('recordingStopped'));
        }
        
        // Deactivate enhanced hover recorder if available
        if (typeof window !== 'undefined' && window.enhancedHoverRecorder) {
            window.enhancedHoverRecorder.isRecording = false;
            window.enhancedHoverRecorder.clearHover();
        }
    }

    getFrameLocation(currentWindow = window) {
        const path = [];

        while (currentWindow && !(currentWindow === window.top || currentWindow.originalWindow === window.top)) {
            const frames = currentWindow.parent.frames;
            for (let index = 0; index < frames.length; index++) {
                if (frames[index] === currentWindow || frames[index] === currentWindow.originalWindow) {
                    path.unshift(index);
                }
            }
            currentWindow = currentWindow.parent;
        }

        const frameLocation = ["root", ...path].join(":");
        return frameLocation;
    }

    record(command, target, value, insertBeforeLastCommand, actualFrameLocation) {
        let self = this;
        if (!target[0].some(e => e?.includes instanceof Function && e.includes('popupInjectionKR'))) {
            // Get enhanced settings if available
            let enhancedSettings = {};
            if (window.enhancedHoverRecorder) {
                enhancedSettings = {
                    includeValidations: window.enhancedHoverRecorder.includeValidations || false,
                    includeScreenshots: window.enhancedHoverRecorder.includeScreenshots || false,
                    includeLogging: window.enhancedHoverRecorder.includeLogging || false,
                    includeIfElse: window.enhancedHoverRecorder.includeIfElse || false
                };
            }
            
            browser.runtime.sendMessage({
                command: command,
                target: target,
                value: value,
                insertBeforeLastCommand: insertBeforeLastCommand,
                frameLocation: (actualFrameLocation != undefined) ? actualFrameLocation : this.frameLocation,
                // Include enhanced settings for Robot Framework export
                includeValidations: enhancedSettings.includeValidations,
                includeScreenshots: enhancedSettings.includeScreenshots,
                includeLogging: enhancedSettings.includeLogging,
                includeIfElse: enhancedSettings.includeIfElse
            }).catch(function (reason) {
                // If receiving end does not exist, detach the recorder
                /* KAT-BEGIN remove self.detach
                self.detach();
                KAT-END */
            });
        }
    }
}

Recorder.eventHandlers = {};
Recorder.addEventHandler = function (handlerName, eventName, handler, options) {
    handler.handlerName = handlerName;
    if (!options) options = false;
    let key = options ? ('C_' + eventName) : eventName;
    if (!this.eventHandlers[key]) {
        this.eventHandlers[key] = [];
    }
    this.eventHandlers[key].push(handler);
}


// TODO: new by another object
var recorder = new Recorder(window);

// TODO: move to appropriate file
// show element
function startShowElement(message, sender, sendResponse) {
    if (message.showElement) {
        result = selenium["doShowElement"](message.targetValue);
        return Promise.resolve({ result: result });
    }
}
browser.runtime.onMessage.addListener(startShowElement);

// Enhanced dropdown detection
// Load the dropdown detector script
const dropdownDetectorScript = document.createElement('script');
dropdownDetectorScript.src = browser.runtime.getURL('content/dropdown-detector.js');
dropdownDetectorScript.onload = function() {
    console.log('Dropdown detector loaded successfully');
};
document.head.appendChild(dropdownDetectorScript);

// Enhanced hover recorder - initialize directly in content script
// The enhanced hover recorder is now loaded as a content script, so we just need to ensure it's activated
if (typeof window !== 'undefined' && window.enhancedHoverRecorder) {
    console.log('Enhanced hover recorder already loaded');
    // Ensure it's properly integrated if recording is already active
    if (recorder.attached) {
        window.enhancedHoverRecorder.isRecording = true;
        console.log('Enhanced hover recorder activated for existing recording session');
    }
} else {
    console.log('Enhanced hover recorder will be loaded as content script');
    // Set up a listener for when the enhanced hover recorder becomes available
    const checkHoverRecorder = setInterval(() => {
        if (window.enhancedHoverRecorder) {
            console.log('Enhanced hover recorder now available');
            clearInterval(checkHoverRecorder);
            // Ensure it's properly integrated if recording is active
            if (recorder.attached) {
                window.enhancedHoverRecorder.isRecording = true;
                console.log('Enhanced hover recorder activated for existing recording session');
            }
        }
    }, 100);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
        clearInterval(checkHoverRecorder);
    }, 10000);
}

// Enhanced dropdown recorder
// Load the enhanced dropdown recorder script
const enhancedDropdownRecorderScript = document.createElement('script');
enhancedDropdownRecorderScript.src = browser.runtime.getURL('content/enhanced-dropdown-recorder.js');
enhancedDropdownRecorderScript.onload = function() {
    console.log('Enhanced dropdown recorder loaded successfully');
};
document.head.appendChild(enhancedDropdownRecorderScript);
