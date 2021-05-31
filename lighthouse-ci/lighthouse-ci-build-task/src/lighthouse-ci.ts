import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url = require('url');
import * as fs from "fs";
import * as os from "os";
import { throws } from 'assert';
import { LightHouseCIBuildContext } from './lighthouse-ci-build-context';
var uuidV4 = require('uuid/v4');

export class lighthouseCI {

    private command: string;
    private configFilePath: string;
    private parameters: string;
    private targetArtifact: string;
    private failOnStderr: boolean;

    constructor() {

        this.command = tasklib.getInput('command');

        this.configFilePath = tasklib.filePathSupplied('configFilePath') ?
            `--config ${tasklib.getPathInput('configFilePath', false, true)}` : "";

        this.parameters = tasklib.getInput('parameters', false) || "";

        this.failOnStderr = tasklib.getBoolInput('failOnStderr',false) || true;

        this.targetArtifact = tasklib.filePathSupplied('targetArtifactPath') ?
            `${tasklib.getPathInput('targetArtifactPath', false, true)}` : "";
    }

    public async run() {

        try {

            if (await this.installLightHouse() && await this.setBuildContext()) {

                let lighthouse = tasklib.tool('lhci');
                lighthouse
                    .line(`${this.command} ${this.configFilePath} ${this.parameters} 2> >(while read line; do (>&2 echo "STDERROR: $line"); done)`)
                    .exec(<toolrunner.IExecOptions>{ 
                        failOnStdErr: (this.command == 'autorun' && this.failOnStderr), 
                        cwd: path.dirname(tasklib.getPathInput('configFilePath')),
                        outStream: process.stdout as unknown,
                        errStream: process.stdout as unknown,
                     })
                    .then(() => {
                    },
                        (error) => {
                            tasklib.setResult(tasklib.TaskResult.Failed, error);
                        }
                    )
            }
        }
        catch (error) {
            tasklib.setResult(tasklib.TaskResult.Failed, error.message);
        }
    }

    private async setBuildContext(): Promise<boolean> {

        if (this.command == 'autorun' || this.command == 'upload' || this.command == 'healthcheck') {

            tasklib.debug('--------------------------- Setting Up Build Context for LightHouse CI--------------------------------')
            let LHCIbuildContext = new LightHouseCIBuildContext(this.targetArtifact);
            LHCIbuildContext.setBuildContext();
            tasklib.debug('---------------------------Build Context Successfully Set-Up----------------------------- ');
        }        
        return true;
    }

    private async installLightHouse(): Promise<boolean> {
        let lhci:string = tasklib.which('lhci', false);
        if (!lhci) {

            tasklib.debug('-------------------------Lighthouse CI not found. Installing NPM Package --------------------------------')

            let tempDirectory = tasklib.getVariable('agent.tempDirectory');
            tasklib.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
            let filePath = path.join(tempDirectory, uuidV4() + '.sh');

            if (os.platform() === "win32") {
                fs.writeFileSync(filePath, 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && npm install -g @lhci/cli puppeteer', { encoding: 'utf8' });
            }
            else {
                fs.writeFileSync(filePath, 'sudo PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install -g @lhci/cli puppeteer', { encoding: 'utf8' });
            }

            var lighthouseInstallResult = await tasklib.tool(tasklib.which('bash', true))
                .arg('--noprofile')
                .arg(`--norc`)
                .arg(filePath)
                .exec();

            if (lighthouseInstallResult !== 0) {
                throw 'Failed to install Lighthouse CI and Puppeteer.';
            }
            else {
                tasklib.debug('------------------------------------ Successfully Installed Lighthouse CI and Puppeteer -----------------------------');
                return true;
            }
        }
        else {
            tasklib.debug(`LightHouse CI installation found at ${lhci}.`);
        }
        return true;
    }
}

var exe = new lighthouseCI();
exe.run().catch((reason) => tasklib.setResult(tasklib.TaskResult.Failed, reason));