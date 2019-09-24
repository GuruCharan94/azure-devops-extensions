import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';

async function run() {
    try {

        // Read Inputs to Task
        let targetURL: string = tasklib.getInput('targetURL', true);
        let configFilePath: string = tasklib.filePathSupplied('configFilePath') ? 
                                        `--config-path ${tasklib.getPathInput('configFilePath', false, true)}` : "" ;
        let parameters: string = tasklib.getInput('parameters', false) || "";

        const lighthousePath = path.join(__dirname, 'node_modules','.bin','lighthouse');
        tasklib.mkdirP("lighthouse-reports");
        tasklib.cd("lighthouse-reports");
        
        const lighthouse  = tasklib.tool(lighthousePath);
        lighthouse.arg(targetURL)                
                .line(`--output json --output html ${parameters} ${configFilePath}`)                
                .exec()
                .then(() => {
                    // Decorate Build / Release Summary with report                    
                    let htmlReports = tasklib.findMatch(tasklib.cwd(),"*.html");

                    htmlReports.forEach(report => {

                        tasklib.addAttachment("gurucharan94.lighthouse-html-artifact",`gurucharan94-lighthouse-report`,report);

                    });
                })
    }

    catch (err) {
        tasklib.setResult(tasklib.TaskResult.Failed, err.message);
    }
}

run();