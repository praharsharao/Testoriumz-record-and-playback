import { TestData } from "./models/test-model/test-data.js";
import {
    getCommandName,
    getCommandTarget,
    getCommandValue,
    getTdRealValueNode,
    getTdShowValueNode
} from "./view/records-grid/record-utils.js";
import { makeTextFile } from "./services/helper-service/make-text-file.js";
import { modifyCaseSuite } from "./view/records-grid/modify-case-suite.js";
import { Log } from "./models/logger/logger.js";
import { genCommandDatalist } from "./view/command-toolbar/generate-command-data-list.js";
import { readSuiteFromString } from "./services/html-service/read-suite-from-string.js";
import { ProfileData } from "./models/global-profile/profile-data.js";
import { parseData, saveDataFiles } from "./services/data-file-service/data-file-services.js";


window.newFormatters = {};
window.KRData = new TestData();
window.profileData = new ProfileData();
window.getTdRealValueNode = getTdRealValueNode;
window.getTdShowValueNode = getTdShowValueNode;
window.getCommandName = getCommandName;
window.getCommandTarget = getCommandTarget;
window.getCommandValue = getCommandValue;
window.readSuiteFromString = readSuiteFromString;
window.makeTextFile = makeTextFile;
window.modifyCaseSuite = modifyCaseSuite;
window.formalCommands = {};
window.genCommandDatalist = genCommandDatalist;
window.Log = Log;
window.dataFiles;
window.saveDataFiles = saveDataFiles;
window.parseData = parseData;
$(document).ready(function(){
    window.sideex_log = new Log(document.getElementById("logcontainer"));
    window.help_log = new Log(document.getElementById("refercontainer"));
});





