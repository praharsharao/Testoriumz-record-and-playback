import { Menu } from "../../models/menu/menu.js";
import { MenuItem } from "../../models/menu/menu-item.js";
import {
    generateAddCommand,
    generateCopyCommand,
    generateDeleteAllCommand,
    generateDeleteSelectedCommand,
    generatePasteCommand,
    generateSetBreakpointCommand,
} from "../../services/records-grid-service/command-generators.js";


const addItem = new MenuItem("grid-add", `Add a test step <span class="hotKey">Ctrl+I</span>`, generateAddCommand);
const deleteItem = new MenuItem("grid-delete", `Delete Command <span class="hotKey"></span>`, generateDeleteSelectedCommand)
const deleteAllItem = new MenuItem("grid-deleteAll", `Delete All Commands`, generateDeleteAllCommand);
const copyItem = new MenuItem("grid-copy", `Copy Command <span class="hotKey">Ctrl+C</span>`, generateCopyCommand);
const pasteItem = new MenuItem("grid-paste", `Paste Command <span class="hotKey">Ctrl+V</span>`, generatePasteCommand);
const breakpointItem = new MenuItem("grid-breakpoint", `Toggle Breakpoint </a><span class="hotKey">Ctrl+B</span>`, generateSetBreakpointCommand);

const commandGridMenu = new Menu("command-grid-menu");
commandGridMenu.add(addItem);
commandGridMenu.add(breakpointItem);
// commandGridMenu.add(deleteItem);
// commandGridMenu.add(deleteAllItem);
// commandGridMenu.add(copyItem);
// commandGridMenu.add(pasteItem);


export { commandGridMenu };