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
        

        tasklib.mkdirP(resultsFolder);
        tasklib.cd(resultsFolder);
        
        const lighthouse  = tasklib.tool(lighthousePath);
        lighthouse.arg(targetURL)                
                .line(`--output json --output html ${parameters} ${configFilePath}`)                
                .exec()
                .then(() => {
                    let htmlReports = tasklib.findMatch(tasklib.cwd(),"*.html");

                    htmlReports.forEach(report => {
                        tasklib.addAttachment("gurucharan94.lighthouse-html-artifact", `${url.parse(targetURL).hostname!}-${url.parse(targetURL).path!}` ,report);

                    });
                },
                (error) => {
                    tasklib.setResult(tasklib.TaskResult.Failed, error);            
                }
                )
    }
    catch (err) {
        tasklib.setResult(tasklib.TaskResult.Failed, err.message);
    }

    finally {
        tasklib.rmRF(resultsFolder);
    }
}

run();