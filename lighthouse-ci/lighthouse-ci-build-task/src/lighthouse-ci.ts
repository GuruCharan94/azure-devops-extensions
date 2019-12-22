import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url = require('url');
import * as fs from "fs";
import * as os from "os";

async function run() {
    try {

        /// let lighthouseCIPath: string = path.join(__dirname, 'node_modules', '.bin', 'lhci');
        let lighthouseCIPath: string = tasklib.which('lhci');
        
        // Read Inputs
        let command: string = tasklib.getInput('command');
        let configFilePath: string = tasklib.filePathSupplied('configFilePath') ?
            `--config ${tasklib.getPathInput('configFilePath', false, true)}` : "";
        let parameters: string = tasklib.getInput('parameters', false) || "";

        let isWindows: Boolean = os.platform() === "win32";

        if (isWindows) {
            lighthouseCIPath += ".cmd";
        } else {
            fs.chmodSync(lighthouseCIPath, "777");
        }

        let lighthouse = tasklib.tool('lhci');

        lighthouse
            .line(`${command} ${configFilePath} ${parameters}`)
            .exec()
            .then(() => {
            },
                (error) => {
                    tasklib.setResult(tasklib.TaskResult.Failed, error);
                }
            )
    }
    catch (error) {
        tasklib.setResult(tasklib.TaskResult.Failed, error.message);
    }
}

run();