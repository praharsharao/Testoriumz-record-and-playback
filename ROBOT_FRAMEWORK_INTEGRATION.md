# Robot Framework Integration

## Overview

The Testoriumz Recorder now supports Robot Framework commands and export functionality. You can now:

1. **Use Robot Framework commands** directly in your test cases
2. **Export test cases** to Robot Framework format
3. **Convert existing Selenium IDE commands** to Robot Framework syntax

## How to Use Robot Framework Commands

### 1. In the Command Column

When editing a command in the Command column, you can now select from Robot Framework commands:

- **Go To** - Navigate to a URL (equivalent to Selenium's "open")
- **Click Element** - Click on an element (equivalent to Selenium's "click")
- **Click Link** - Click on a link by text (equivalent to Selenium's "click link")
- **Input Text** - Type text into an input field (equivalent to Selenium's "type")
- **Input Password** - Type password into a password field
- **Select From List By Label** - Select from dropdown by visible text
- **Wait Until Element Is Visible** - Wait for element to be visible
- **Page Should Contain** - Assert page contains text
- **Element Should Be Visible** - Assert element is visible

### 2. Command Conversion

The recorder automatically converts common Selenium commands to Robot Framework equivalents:

| Selenium Command | Robot Framework Equivalent |
|------------------|---------------------------|
| `open` | `Go To` |
| `click` | `Click Element` |
| `click link=text` | `Click Link` |
| `type` | `Input Text` |
| `select` | `Select From List By Label` |
| `submit` | `Submit Form` |
| `pause` | `Sleep` |
| `refresh` | `Reload Page` |
| `goBack` | `Go Back` |

## Exporting to Robot Framework

### 1. From the Main Panel

1. Click on the **Export** button
2. Select **Robot Framework** from the dropdown
3. Click **Export** to generate the Robot Framework test file

### 2. From KS-Export Dialog

1. Go to **File** → **Export to Katalon Studio**
2. Select **Robot Framework** from the language dropdown
3. Click **Export**

## Generated Robot Framework Code

The exported code will look like this:

```robotframework
*** Settings ***
Library    SeleniumLibrary
Library    Collections

*** Variables ***
${BROWSER}    chrome
${BASE_URL}    https://example.com

*** Test Cases ***
Untitled Test Case
    [Documentation]    Untitled Test Case
    [Tags]    selenium    web

    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window

    Go To    https://example.com/login
    Input Text    username    admin
    Input Password    password    secret
    Click Element    login-button
    Wait Until Page Contains    Dashboard
    Page Should Contain    Welcome

    [Teardown]    Close Browser
```

## Available Robot Framework Commands

### Navigation Commands
- `Go To` - Navigate to URL
- `Go Back` - Go back in browser history
- `Reload Page` - Refresh the current page

### Element Interaction Commands
- `Click Element` - Click on any element
- `Click Link` - Click on a link by text
- `Double Click Element` - Double-click on element
- `Input Text` - Type text into input field
- `Input Password` - Type password into password field
- `Clear Element Text` - Clear text from input field
- `Submit Form` - Submit a form
- `Select From List By Label` - Select dropdown option by text
- `Select From List By Value` - Select dropdown option by value
- `Select From List By Index` - Select dropdown option by index

### Wait Commands
- `Wait Until Element Is Visible` - Wait for element to be visible
- `Wait Until Element Is Clickable` - Wait for element to be clickable
- `Wait Until Page Contains` - Wait for page to contain text
- `Wait Until Page Contains Element` - Wait for element to be present
- `Wait Until Location Contains` - Wait for URL to contain text
- `Wait Until Location Is` - Wait for specific URL

### Assertion Commands
- `Page Should Contain` - Assert page contains text
- `Page Should Not Contain` - Assert page doesn't contain text
- `Element Should Be Visible` - Assert element is visible
- `Element Should Not Be Visible` - Assert element is not visible
- `Element Should Be Enabled` - Assert element is enabled
- `Element Should Be Disabled` - Assert element is disabled
- `Element Should Contain` - Assert element contains text
- `Title Should Be` - Assert page title
- `Location Should Be` - Assert current URL

### Utility Commands
- `Get Title` - Get page title
- `Get Text` - Get element text
- `Get Value` - Get element value
- `Capture Page Screenshot` - Take screenshot
- `Sleep` - Wait for specified time
- `Focus` - Focus on element
- `Scroll Element Into View` - Scroll element into viewport

## Tips for Best Results

1. **Use Robot Framework commands directly** when recording new test cases
2. **Convert existing Selenium commands** by changing them in the Command column
3. **Use descriptive targets** like `id=username` or `xpath=//button[@text='Login']`
4. **Add appropriate waits** using `Wait Until` commands for dynamic content
5. **Use assertions** to verify expected behavior

## Troubleshooting

### Common Issues

1. **Command not recognized**: Make sure the command is spelled exactly as shown in the dropdown
2. **Export fails**: Check that all commands have valid targets and values
3. **Generated code errors**: Verify that Robot Framework and SeleniumLibrary are installed

### Getting Help

- Check the Robot Framework documentation: https://robotframework.org/
- Review the SeleniumLibrary keywords: https://robotframework.org/SeleniumLibrary/
- Use the recorder's built-in command reference for syntax help

## Examples

### Login Test Case
```robotframework
*** Test Cases ***
Login Test
    Go To    https://example.com/login
    Input Text    id=username    admin
    Input Password    id=password    secret
    Click Element    id=login-button
    Wait Until Page Contains    Dashboard
    Page Should Contain    Welcome Admin
```

### Form Validation Test
```robotframework
*** Test Cases ***
Form Validation
    Go To    https://example.com/contact
    Input Text    name    John Doe
    Input Text    email    john@example.com
    Input Text    message    Hello World
    Click Element    id=submit-button
    Wait Until Page Contains    Thank you
    Page Should Contain    Your message has been sent
```

This integration makes it easy to create Robot Framework test cases directly in the recorder and export them for use in your Robot Framework test suites. 