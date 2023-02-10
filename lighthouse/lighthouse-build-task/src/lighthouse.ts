import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url=require('url');
import * as fs from "fs";
import * as os from "os";

async function run() {
    let resultsFolder: string = "lighthouse-reports"
    try {

        // Read Inputs to Task
        let targetURL: string = tasklib.getInput('targetURL', true) || '';
        let configFilePath: string = tasklib.filePathSupplied('configFilePath') ? 
                                        `--config-path ${tasklib.getPathInput('configFilePath', false, true)}` : "" ;
        let parameters: string = tasklib.getInput('parameters', false) || "";        
        let isWindows: Boolean = os.platform() === "win32";
        let lighthousePath: string = path.join(__dirname, 'node_modules','.bin','lighthouse');
        
        
        if (isWindows) {        
            lighthousePath += ".cmd";        
        } else {          
            fs.chmodSync(lighthousePath, "777");
        }

        tasklib.mkdirP(resultsFolder);
        tasklib.cd(resultsFolder);
        
        let referenceTime = new Date().getTime();

        const lighthouse  = tasklib.tool(lighthousePath);
        lighthouse.arg(targetURL)    
                .line(`--output json --output html ${parameters} ${configFilePath}`)                
                .exec()
                .then(() => {

                    let htmlReports = tasklib.findMatch(tasklib.cwd(),"*.html");
                    htmlReports.forEach(function(file){
                        let fileCreatedTime = fs.statSync(file).ctime.getTime();
                        if(fileCreatedTime > referenceTime)
                        {
                            // Replace '/' with _ because file name cannot contain '/'.
                            let attachmentName = (url.parse(targetURL).hostname! + url.parse(targetURL).path!.replace(/\//g, "_")).slice(0, -1);
                            tasklib.addAttachment("gurucharan94.lighthouse-html-artifact", attachmentName, file);
                        }
                    })
                },
                (error) => {
                    tasklib.setResult(tasklib.TaskResult.Failed, error);           
                }
                )
    }
    catch (error : any) {
        tasklib.setResult(tasklib.TaskResult.Failed, error.message);
    }
}
run();