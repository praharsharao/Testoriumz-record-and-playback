// Robot Framework Command Override
// This script overrides the existing command loading to use Robot Framework keywords

// Wait for the page to load and then override the commands
document.addEventListener('DOMContentLoaded', function() {
    // Override the command loading function
    if (typeof window._loadSeleniumCommands === 'function') {
        // Store the original function
        window._originalLoadSeleniumCommands = window._loadSeleniumCommands;
        
        // Replace with Robot Framework commands
        window._loadSeleniumCommands = function() {
            // Return the Robot Framework commands instead of Selenium commands
            if (window.robotFrameworkCommands && Array.isArray(window.robotFrameworkCommands)) {
                return window.robotFrameworkCommands;
            }
            
            // Fallback to original if Robot Framework commands aren't loaded
            return window._originalLoadSeleniumCommands();
        };
    }
    
    // Also override the commands array directly if it exists
    if (window.commands && Array.isArray(window.commands)) {
        if (window.robotFrameworkCommands && Array.isArray(window.robotFrameworkCommands)) {
            // Clear existing commands and add Robot Framework ones
            window.commands.length = 0;
            window.commands.push(...window.robotFrameworkCommands);
        }
    }
});

// Alternative approach: override when the commands are actually loaded
window.addEventListener('load', function() {
    setTimeout(function() {
        // Find and replace the commands in the dropdown
        const commandDropdowns = document.querySelectorAll('select[data-command], .command-dropdown, #command-dropdown');
        
        commandDropdowns.forEach(function(dropdown) {
            if (window.robotFrameworkCommands && Array.isArray(window.robotFrameworkCommands)) {
                // Clear existing options
                dropdown.innerHTML = '';
                
                // Add Robot Framework commands as options
                window.robotFrameworkCommands.forEach(function(command) {
                    const option = document.createElement('option');
                    option.value = command;
                    option.textContent = command;
                    dropdown.appendChild(option);
                });
            }
        });
    }, 1000); // Wait a bit for the page to fully load
}); 