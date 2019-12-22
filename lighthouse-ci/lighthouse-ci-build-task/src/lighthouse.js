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
const path = __importStar(require("path"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let node = tasklib.tool('node');
            let lighthouseCIPath = path.join(__dirname, 'node_modules', '@lhci', 'cli', 'src', 'cli.js');
            // Read Inputs
            let command = tasklib.getInput('command') || 'healthcheck';
            let configFilePath = tasklib.filePathSupplied('configFilePath') ?
                `--config ${tasklib.getPathInput('configFilePath', false, true)}` : "";
            let parameters = tasklib.getInput('parameters', false) || "";
            node.arg(lighthouseCIPath)
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
