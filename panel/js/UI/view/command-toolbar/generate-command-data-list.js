const genCommandDatalist = () => {
  var supportedCommand;
  
  // Check if Robot Framework commands should be loaded
  if (window.loadRobotFrameworkCommands) {
    supportedCommand = _loadRobotFrameworkCommands();
  } else {
    supportedCommand = _loadSeleniumCommands();
  }

  var datalistHTML = "";
  formalCommands = {};
  
  // Add Robot Framework commands for display
  supportedCommand.forEach(function(command) {
    datalistHTML += ('<option value="' + command + '">' + command + '</option>\n');
    formalCommands[command.toLowerCase()] = command;
  });
  
  // Also add Selenium IDE commands for execution compatibility
  if (window.loadRobotFrameworkCommands) {
    const seleniumCommands = _loadSeleniumCommands();
    seleniumCommands.forEach(function(command) {
      formalCommands[command.toLowerCase()] = command;
    });
  }

  return datalistHTML;
}

export { genCommandDatalist }
