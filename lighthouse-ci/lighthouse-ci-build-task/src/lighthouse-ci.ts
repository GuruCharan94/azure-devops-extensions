import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url = require('url');
import * as fs from "fs";
import * as os from "os";
import { throws } from 'assert';
import { BuildContext } from './lighthouse-ci-build-context';

class Settings {

    public static IsBuildContextApplied: boolean = tasklib.getTaskVariable('LHCI_BuildContextApplied') ? true : false;
    public static LightHouseWorkingDirectory: string = tasklib.getTaskVariable('LightHouseWorkingDirectory');

    public static ApplyBuildContext() {
        tasklib.setTaskVariable("LHCI_BuildContextApplied", "TRUE", false); // Set Variable
    }

    public static SetLightHouseWorkingDirectory(path: string) {
        tasklib.setTaskVariable("LightHouseWorkingDirectory", path, false);
    }
}

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
    }

    public async run() {

        try {

            this.Init();


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

    private Init() {

        tasklib.tool('npm')
        .arg()
        .execSync()

        if (!Settings.IsBuildContextApplied) {
            new BuildContext(this.targetArtifact);
            Settings.ApplyBuildContext();
        }
        if (!Settings.LightHouseWorkingDirectory) {
            if (this.configFilePath) {
                Settings.SetLightHouseWorkingDirectory(path.dirname(tasklib.getPathInput('configFilePath')));
            }
            else {
                Settings.SetLightHouseWorkingDirectory(tasklib.cwd());
            }
        }
        tasklib.cd(Settings.LightHouseWorkingDirectory);
    }
}

var exe = new lighthouseCI();
exe.run().catch((reason) => tasklib.setResult(tasklib.TaskResult.Failed, reason));