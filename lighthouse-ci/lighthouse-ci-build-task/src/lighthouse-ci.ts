import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url = require('url');
import * as fs from "fs";
import * as os from "os";

async function run() {
    try {
        
        // Read Inputs
        let command: string = tasklib.getInput('command');
        let configFilePath: string = tasklib.filePathSupplied('configFilePath') ?
            `--config ${tasklib.getPathInput('configFilePath', false, true)}` : "";
        let parameters: string = tasklib.getInput('parameters', false) || "";
        let targetArtifact: string = tasklib.getInput('')
        
        // LHCI CWD Prep
        let LHCI_DIR = tasklib.getTaskVariable('LHCI_DIR');
        if(!LHCI_DIR)
        {
            LHCI_DIR = tasklib.cwd(); // Directory inside which lighthouse is executed.
            if (configFilePath) {
                // If path to Lighthouse CI config is provided, change cwd to the folder containing the file.
                // All path to related files, Lighthouse & Puppeteer Config is there.
                LHCI_DIR=path.dirname(tasklib.getPathInput('configFilePath'));
            }
        }
        tasklib.cd(LHCI_DIR);

        // Get settings
        


        // Execute Lighthouse
        tasklib.setTaskVariable("LHCI_DIR",LHCI_DIR, false);
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