# Enhanced Hover Recorder Feature

## Overview

The Enhanced Hover Recorder is a new feature that provides advanced hover tracking with visual feedback and element collection for the TestoriumZ recorder extension. It allows users to hover over elements, see visual feedback, and record hover actions as part of their test cases.

## Features

### Visual Feedback
- **Cursor Tracking**: A red circular hover box follows the cursor position
- **Element Highlighting**: Elements get a red outline when hovered
- **Color Change**: After 1 second of hovering, the outline changes to green
- **Info Tooltip**: Displays detailed element information near the cursor

### Element Information Collection
- **Tag Information**: Element tag name, ID, and classes
- **Text Content**: First 50 characters of element text
- **Attributes**: Type, name, value, href, src, etc.
- **XPath Generation**: Automatic XPath generation for element targeting

### Recording Integration
- **Hover Actions**: Records hover commands with duration and element info
- **Test Case Integration**: Adds hover commands to the current test case
- **Playback Support**: Hover commands can be played back during test execution

## How It Works

### 1. Recording Start
When recording begins, the enhanced hover recorder is automatically activated and starts monitoring mouse movements and element interactions.

### 2. Hover Detection
- **Mouse Movement**: Tracks cursor position and updates the hover box
- **Element Hover**: Detects when mouse enters an element
- **Visual Feedback**: Applies red outline to hovered element
- **Timer Start**: Begins 1-second countdown for hover activation

### 3. Hover Activation
After 1 second of continuous hovering:
- **Color Change**: Element outline changes from red to green
- **Hover Box**: Changes color to indicate active hover state
- **Tooltip Update**: Shows "Hover Active - Click to record action"

### 4. Action Recording
When user clicks on a hovered element:
- **Data Collection**: Gathers element information and hover duration
- **Command Creation**: Creates hover command with XPath and metadata
- **Test Case Addition**: Adds the hover command to the current test case

## Implementation Details

### Files Modified/Created

#### New Files
- `content/enhanced-hover-recorder.js` - Main hover recorder implementation
- `test-hover-recorder.html` - Test page for demonstrating the feature
- `ENHANCED_HOVER_RECORDER_README.md` - This documentation

#### Modified Files
- `content/recorder.js` - Added enhanced hover recorder integration
- `content/command-receiver.js` - Added hover command handling
- `panel/js/background/recorder.js` - Added hover command processing
- `manifest.json` - Added enhanced hover recorder to web accessible resources

### Key Components

#### EnhancedHoverRecorder Class
```javascript
class EnhancedHoverRecorder {
    constructor() {
        this.isRecording = false;
        this.hoverBox = null;
        this.hoverTimeout = null;
        this.currentElement = null;
        this.hoverStartTime = null;
        this.isHoverActive = false;
        this.hoverDuration = 1000; // 1 second
        this.originalOutline = null;
    }
}
```

#### Visual Elements
- **Hover Box**: Circular indicator that follows cursor
- **Info Tooltip**: Displays element information
- **Element Outline**: Visual feedback on hovered elements

#### Event Handlers
- `mousemove`: Updates hover box position
- `mouseover`: Handles element hover detection
- `mouseout`: Handles element leave events
- `click`: Records hover actions

### Command Structure

Hover commands are recorded with the following structure:
```javascript
{
    command: 'hover',
    target: '//*[@id="element-id"]', // XPath
    value: 'Element Info | Duration: 1500ms',
    duration: 1500,
    timestamp: 1234567890,
    elementInfo: 'Tag: button#test-button-1.btn\nText: Primary Button'
}
```

## Usage Instructions

### For Users

1. **Start Recording**: Click the "Record" button in the TestoriumZ extension
2. **Hover Over Elements**: Move your mouse over any element on the page
3. **Wait for Feedback**: The element will get a red outline, then green after 1 second
4. **Click to Record**: Click on the hovered element to record the hover action
5. **Check Results**: The hover action will appear in your test case

### For Developers

#### Testing the Feature
1. Load the extension in a browser
2. Open `test-hover-recorder.html` in a tab
3. Start recording using the extension
4. Hover over various elements and observe the visual feedback
5. Click on hovered elements to record actions
6. Check the recorded test case for hover commands

#### Customization
The hover recorder can be customized by modifying:
- `hoverDuration`: Change the time before hover activation (default: 1000ms)
- Visual styles: Modify CSS in the `createHoverBox()` method
- Element information: Extend the `getElementInfo()` method
- Command format: Modify the `sendHoverAction()` method

## Technical Specifications

### Browser Compatibility
- Chrome/Chromium (Manifest V3)
- Firefox (WebExtensions)
- Edge (Chromium-based)

### Performance Considerations
- Lightweight implementation with minimal performance impact
- Efficient event handling with proper cleanup
- Memory management for DOM elements and timeouts

### Security
- No sensitive data collection
- Only element structure and attributes are captured
- XPath generation uses safe DOM traversal methods

## Troubleshooting

### Common Issues

1. **Hover Box Not Appearing**
   - Check if recording is active
   - Verify the extension is properly loaded
   - Check browser console for errors

2. **Element Outline Not Showing**
   - Ensure the element is not being overridden by CSS
   - Check if the element has existing outline styles
   - Verify the element is not in an iframe

3. **Hover Actions Not Recording**
   - Check if the test case is properly selected
   - Verify the background recorder is attached
   - Check browser console for error messages

### Debug Mode
Enable debug logging by setting:
```javascript
window.enhancedHoverRecorder.debug = true;
```

## Future Enhancements

### Planned Features
- **Hover Duration Customization**: Allow users to set custom hover durations
- **Advanced Element Selection**: Support for complex element selectors
- **Hover Patterns**: Record hover sequences and patterns
- **Visual Customization**: User-configurable hover box styles
- **Integration with Playback**: Enhanced hover simulation during test playback

### Potential Improvements
- **Performance Optimization**: Reduce DOM queries and improve efficiency
- **Accessibility**: Better support for screen readers and assistive technologies
- **Mobile Support**: Touch-based hover detection for mobile devices
- **Analytics**: Track hover patterns and usage statistics

## Contributing

To contribute to the enhanced hover recorder:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- Follow existing code style and conventions
- Add comments for complex logic
- Include error handling for edge cases
- Test thoroughly before submitting

## License

This feature is part of the TestoriumZ recorder extension and follows the same licensing terms as the main project.
