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
        
        // Convert Selenium commands to Robot Framework commands automatically
        let robotCommand = this.convertToRobotFramework(command, target, value);
        
        if (!target[0].some(e => e?.includes instanceof Function && e.includes('popupInjectionKR'))) {
            browser.runtime.sendMessage({
                command: robotCommand,
                target: target,
                value: value,
                insertBeforeLastCommand: insertBeforeLastCommand,
                frameLocation: (actualFrameLocation != undefined) ? actualFrameLocation : this.frameLocation,
            }).catch(function (reason) {
                // If receiving end does not exist, detach the recorder
                /* KAT-BEGIN remove self.detach
                self.detach();
                KAT-END */
            });
        }
    }
    
    // Convert Selenium commands to Robot Framework commands
    convertToRobotFramework(command, target, value) {
        switch (command.toLowerCase()) {
            case 'open':
                return 'Go To';
                
            case 'click':
                // Check if it's a link click
                if (target && target[0] && target[0][0] && target[0][0].startsWith('link=')) {
                    return 'Click Link';
                }
                return 'Click Element';
                
            case 'type':
                return 'Input Text';
                
            case 'select':
                return 'Select From List By Label';
                
            case 'submit':
                return 'Submit Form';
                
            case 'waitforelementpresent':
                return 'Wait Until Element Is Visible';
                
            case 'waitforelementclickable':
                return 'Wait Until Element Is Clickable';
                
            case 'waitfortext':
                return 'Wait Until Page Contains';
                
            case 'waitforelement':
                return 'Wait Until Page Contains Element';
                
            case 'asserttext':
                return 'Page Should Contain';
                
            case 'assertnottext':
                return 'Page Should Not Contain';
                
            case 'assertelementpresent':
                return 'Element Should Be Visible';
                
            case 'assertelementnotpresent':
                return 'Element Should Not Be Visible';
                
            case 'assertelementenabled':
                return 'Element Should Be Enabled';
                
            case 'assertelementdisabled':
                return 'Element Should Be Disabled';
                
            case 'storetitle':
                return 'Get Title';
                
            case 'storetext':
                return 'Get Text';
                
            case 'storevalue':
                return 'Get Value';
                
            case 'captureentirepagescreenshot':
                return 'Capture Page Screenshot';
                
            case 'pause':
                return 'Sleep';
                
            case 'goback':
                return 'Go Back';
                
            case 'refresh':
                return 'Reload Page';
                
            case 'selectwindow':
                return 'Switch Window';
                
            case 'selectframe':
                return 'Switch Frame';
                
            case 'doubleclick':
                return 'Double Click Element';
                
            case 'mouseover':
                return 'Mouse Over';
                
            case 'draganddroptoobject':
                return 'Drag And Drop';
                
            case 'sendkeys':
                return 'Press Keys';
                
            case 'clear':
                return 'Clear Element Text';
                
            case 'focus':
                return 'Focus';
                
            case 'scrollintoview':
                return 'Scroll Element Into View';
                
            default:
                // For unknown commands, try to convert them
                if (command.startsWith('waituntil')) {
                    return 'Wait Until ' + command.substring(9);
                } else if (command.startsWith('assert')) {
                    return 'Element Should ' + command.substring(6);
                } else if (command.startsWith('verify')) {
                    return 'Element Should ' + command.substring(6);
                } else if (command.startsWith('get')) {
                    return 'Get ' + command.substring(3);
                }
                
                // Return the original command if no conversion found
                return command;
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
