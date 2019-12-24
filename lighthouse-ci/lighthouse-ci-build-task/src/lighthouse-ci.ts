import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url = require('url');
import * as fs from "fs";
import * as os from "os";
import { throws } from 'assert';
import { BuildContext } from './lighthouse-ci-build-context';

export class lighthouseCI {

    private command: string;
    private configFilePath: string;
    private parameters: string;
    private targetArtifact: string;

    constructor() {
        this.command = tasklib.getInput('command');

        this.configFilePath = tasklib.filePathSupplied('configFilePath') ?
            `--config ${tasklib.getPathInput('configFilePath', false, true)}` : "";

        this.parameters = tasklib.getInput('parameters', false) || "";

        this.targetArtifact = tasklib.filePathSupplied('targetArtifactPath') ?
            `${tasklib.getPathInput('targetArtifactPath', false, true)}` : "";

        if (!tasklib.getTaskVariable('LHCI_BUILD_CONTEXT_FLAG')) { // If Variable not set in previous task.
            new BuildContext(this.targetArtifact);
            tasklib.setTaskVariable("LHCI_BUILD_CONTEXT_FLAG", 'SET', false); // Set Variable
        }
    }


    public async run() {

        try {
            // LHCI CWD Prep
            let LHCI_DIR = tasklib.getTaskVariable('LHCI_DIR');
            if (!LHCI_DIR) {
                LHCI_DIR = tasklib.cwd(); // Directory inside which lighthouse is executed.
                if (this.configFilePath) {
                    // If path to Lighthouse CI config is provided, change cwd to the folder containing the file.
                    // All path to related files, Lighthouse & Puppeteer Config is there.
                    LHCI_DIR = path.dirname(tasklib.getPathInput('configFilePath'));
                }
            }
            tasklib.cd(LHCI_DIR);

            // Execute Lighthouse
            tasklib.setTaskVariable("LHCI_DIR", LHCI_DIR, false);
            let lighthouse = tasklib.tool('lhci');
            lighthouse
                .line(`${this.command} ${this.configFilePath} ${this.parameters}`)
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
}

var exe = new lighthouseCI();
exe.run().catch((reason) => tasklib.setResult(tasklib.TaskResult.Failed, reason));