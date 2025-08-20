function isObjectEmpty(obj){
    return obj
        && Object.keys(obj).length === 0
        && obj.constructor === Object
}

async function setDefaultSettingData(){
    browser.storage.local.set({
        setting: {
            "self-healing":{
                enable: true,
                locator: ["id", "xpath", "css"],
                excludeCommands: ["verifyElementPresent", "verifyElementNotPresent", "assertElementPresent", "assertElementNotPresent"],
            },
            "timeouts": {
                "selfHealingTimeout": 5000,        // 5 seconds for self-healing attempts
                "implicitWaitTimeout": 15000,      // 15 seconds for implicit waits
                "elementReadinessTimeout": 2000,   // 2 seconds for element readiness check
                "pageLoadTimeout": 30000           // 30 seconds for page load
            },
            "tracking": true,
        }
    });
}

const loadSettingData = async () => {
    let settingData = await browser.storage.local.get("setting");
    if (isObjectEmpty(settingData)){
        await setDefaultSettingData();
    }
}

export {loadSettingData}

loadSettingData();