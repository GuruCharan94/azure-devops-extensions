import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url = require('url');
import * as fs from "fs";
import * as os from "os";
import { throws } from 'assert';
import { BuildContext } from './lighthouse-ci-build-context';
var uuidV4 = require('uuid/v4');

class Settings {

    public IsBuildContextApplied: boolean = tasklib.getVariable('LHCI_BuildContextApplied') ? true : false;
    public LightHouseWorkingDirectory: string = tasklib.getVariable('LHCI_WorkingDirectory');

    public ApplyBuildContext() {
        this.IsBuildContextApplied = true;
        tasklib.setVariable("LHCI_BuildContextApplied", "TRUE", false); // Set Variable
    }

    public SetLightHouseWorkingDirectory(path: string) {
        this.LightHouseWorkingDirectory = path;
        tasklib.setVariable("LHCI_WorkingDirectory", path, false);
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

        // This field is only populated when command type = healthcheck.
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

        if(!tasklib.which('lhci', false)){

            tasklib.debug('Lighthouse CI not found. Installing NPM Package..')

            let tempDirectory = tasklib.getVariable('agent.tempDirectory');
            tasklib.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
            let filePath = path.join(tempDirectory, uuidV4() + '.sh');
            
            if (os.platform() === "win32") {
                fs.writeFileSync(filePath, 'npm install -g @lhci/cli puppeteer', { encoding: 'utf8' });
            }
            else {
                fs.writeFileSync(filePath, 'sudo npm install -g @lhci/cli puppeteer', { encoding: 'utf8' });
            }

            tasklib.tool(tasklib.which('bash', true))
                    .arg('--noprofile')
                    .arg(`--norc`)
                    .arg(filePath)
                    .execSync();

            tasklib.debug('Installed..')
        }
        
        let settings = new Settings();

        if (!settings.IsBuildContextApplied) {
            if (this.command != "healthcheck") {

                tasklib.error('You have to first run Lighthouse CI health check and then run with other commands')

            }
            tasklib.debug('Setting Up Build Context for LHCI..')
            new BuildContext(this.targetArtifact);
            settings.ApplyBuildContext();
            tasklib.debug('Done..');

        }
        if (!settings.LightHouseWorkingDirectory) {
            tasklib.debug('Setting Working Directory..');
            if (this.configFilePath) {
                settings.SetLightHouseWorkingDirectory(path.dirname(tasklib.getPathInput('configFilePath')));
            }
            else {
                settings.SetLightHouseWorkingDirectory(tasklib.cwd());
            }
        }
        tasklib.cd(settings.LightHouseWorkingDirectory);
        tasklib.debug(`Working Dir Set to ${settings.LightHouseWorkingDirectory}`);
    }
}

var exe = new lighthouseCI();
exe.run().catch((reason) => tasklib.setResult(tasklib.TaskResult.Failed, reason));