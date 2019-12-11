import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url=require('url');
import { chmodSync } from "fs";
import * as os from "os";


async function run() {
    let resultsFolder: string = "lighthouse-reports"
    try {

        // Read Inputs to Task
        let targetURL: string = tasklib.getInput('targetURL', true);
        let configFilePath: string = tasklib.filePathSupplied('configFilePath') ? 
                                        `--config-path ${tasklib.getPathInput('configFilePath', false, true)}` : "" ;
        let parameters: string = tasklib.getInput('parameters', false) || "";
        
        let isWindows: Boolean = os.platform() === "win32";

        let lighthousePath: string = path.join(__dirname, 'node_modules','.bin','lighthouse');
        if (isWindows) {
            lighthousePath += ".cmd";
        } else {
            chmodSync(lighthousePath, "777");
        }   

        tasklib.rmRF(resultsFolder);
        tasklib.mkdirP(resultsFolder);
        tasklib.cd(resultsFolder);
        
        const lighthouse  = tasklib.tool(lighthousePath);
        lighthouse.arg(targetURL)                
                .line(`--output json --output html ${parameters} ${configFilePath}`)                
                .exec()
                .then(() => {

                    let htmlReports = tasklib.findMatch(tasklib.cwd(),"*.html");                    
                    let attachmentName = (url.parse(targetURL).hostname! + url.parse(targetURL).path!.replace(/\//g, "_")).slice(0, -1);

                    htmlReports.forEach(report => {
                        tasklib.addAttachment("gurucharan94.lighthouse-html-artifact", attachmentName, report);
                    });
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