"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tasklib = require("azure-pipelines-task-lib/task");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            /// let lighthouseCIPath: string = path.join(__dirname, 'node_modules', '.bin', 'lhci');
            let lighthouseCIPath = tasklib.which('lhci');
            // Read Inputs
            let command = tasklib.getInput('command');
            let configFilePath = tasklib.filePathSupplied('configFilePath') ?
                `--config ${tasklib.getPathInput('configFilePath', false, true)}` : "";
            let parameters = tasklib.getInput('parameters', false) || "";
            let isWindows = os.platform() === "win32";
            if (isWindows) {
                lighthouseCIPath += ".cmd";
            }
            else {
                fs.chmodSync(lighthouseCIPath, "777");
            }
            let lighthouse = tasklib.tool('lhci');
            lighthouse
                .line(`${command} ${configFilePath} ${parameters}`)
                .exec()
                .then(() => {
            }, (error) => {
                tasklib.setResult(tasklib.TaskResult.Failed, error);
            });
        }
        catch (error) {
            tasklib.setResult(tasklib.TaskResult.Failed, error.message);
        }
    });
}
run();
