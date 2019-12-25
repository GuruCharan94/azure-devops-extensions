import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url = require('url');
import * as fs from "fs";
import * as os from "os";
import { throws } from 'assert';
import { BuildContext } from './lighthouse-ci-build-context';

class Settings {

    public IsBuildContextApplied: boolean = tasklib.getTaskVariable('LHCI_BuildContextApplied') ? true : false;
    public LightHouseWorkingDirectory: string = tasklib.getTaskVariable('LightHouseWorkingDirectory');

    public ApplyBuildContext() {
        tasklib.setTaskVariable("LHCI_BuildContextApplied", "TRUE", false); // Set Variable
    }

    public SetLightHouseWorkingDirectory(path: string) {
        this.LightHouseWorkingDirectory = path;
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

    private async Init() {

        //let npm =  tasklib.tool('npm');
        //await npm.arg("install -g @lhci/cli puppeteer").exec();        
        let settings = new Settings();

        if (!settings.IsBuildContextApplied) {
            new BuildContext(this.targetArtifact);
            settings.ApplyBuildContext();
        }
        if (!settings.LightHouseWorkingDirectory) {
            if (this.configFilePath) {
                settings.SetLightHouseWorkingDirectory(path.dirname(tasklib.getPathInput('configFilePath')));
            }
            else {
                settings.SetLightHouseWorkingDirectory(tasklib.cwd());
            }
        }
        tasklib.cd(settings.LightHouseWorkingDirectory);
    }
}

var exe = new lighthouseCI();
exe.run().catch((reason) => tasklib.setResult(tasklib.TaskResult.Failed, reason));