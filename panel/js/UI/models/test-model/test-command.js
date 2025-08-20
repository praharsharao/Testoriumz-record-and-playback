/**
 * Class represents test command  that currently loaded when KR is running
 */
class TestCommand {
    /**
     * Create a TestCommand
     *
     * @param {string} name
     * @param {string} defaultTarget
     * @param {string[]} targets
     * @param {string} value
     * @param {boolean} includeValidations - Whether to include validations in exported code
     * @param {boolean} includeScreenshots - Whether to include screenshots in exported code
     * @param {boolean} includeLogging - Whether to include logging in exported code
     * @param {boolean} includeIfElse - Whether to include if-else statements in exported code
     */
    constructor(name = "", defaultTarget = "", targets = [], value = "", 
                includeValidations = false, includeScreenshots = false, 
                includeLogging = false, includeIfElse = false) {
        this.name = name;
        this.defaultTarget = defaultTarget;
        this.targets = targets;
        this.value = value;
        this.status = null;
        this.state = null;
        
        // Enhanced settings for Robot Framework export
        this.includeValidations = includeValidations;
        this.includeScreenshots = includeScreenshots;
        this.includeLogging = includeLogging;
        this.includeIfElse = includeIfElse;
    }

    setTestCommand(command) {
        let keys = ['name', 'defaultTarget', 'targets', 'value', 'status', 'state', 
                   'includeValidations', 'includeScreenshots', 'includeLogging', 'includeIfElse'];
        let newCommand = new TestCommand();

        for (const key of keys) {
            if (command[key] !== undefined) {
                newCommand[key] = command[key];
            }
        }
        return newCommand;
    }
}

export { TestCommand }