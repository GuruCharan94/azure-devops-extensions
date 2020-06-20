import tasklib = require('azure-pipelines-task-lib/task');
import toolrunner = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import url = require('url');
import * as fs from "fs";
import * as os from "os";
import { throws } from 'assert';

export class LightHouseCIBuildContext {

    private LHCI_BUILD_CONTEXT__GITHUB_REPO_SLUG: string = '';
    private LHCI_BUILD_CONTEXT__CURRENT_HASH: string = '';
    private LHCI_BUILD_CONTEXT__COMMIT_TIME: string = '';
    private LHCI_BUILD_CONTEXT__COMMIT_MESSAGE: string = '';
    private LHCI_BUILD_CONTEXT__CURRENT_BRANCH: string = '';
    private LHCI_BUILD_CONTEXT__AUTHOR: string = '';
    private LHCI_BUILD_CONTEXT__EXTERNAL_BUILD_URL: string = '';

    constructor(targetArtifactPath: string) {

        if (tasklib.getVariable('BUILD_BUILDID')) {

            tasklib.debug('Running Inside a Build Pipeline or YAML multi-stage pipeline. Will infer Build Context from Git Repo');
            this.inferBuildContextFromBuild();
        }
        else {
            tasklib.debug('Running Inside a Release Pipeline. Will infer Build Context from Artifact');
            this.inferBuildContextFromRelease(targetArtifactPath);
        }
    }

    private inferBuildContextFromBuild() {
        this.LHCI_BUILD_CONTEXT__GITHUB_REPO_SLUG = tasklib.getVariable('LHCI_BUILD_CONTEXT__GITHUB_REPO_SLUG') || tasklib.getVariable('BUILD_REPOSITORY_NAME');
        this.LHCI_BUILD_CONTEXT__CURRENT_BRANCH = tasklib.getVariable('LHCI_BUILD_CONTEXT__CURRENT_BRANCH') || tasklib.getVariable('BUILD_SOURCEBRANCHNAME');
        this.LHCI_BUILD_CONTEXT__EXTERNAL_BUILD_URL = `${tasklib.getVariable('SYSTEM_COLLECTIONURI')}${tasklib.getVariable('SYSTEM_TEAMPROJECT')}/_build/results?buildId=${tasklib.getVariable('BUILD_BUILDID')}`;

        if (tasklib.getVariable('PIPELINE_WORKSPACE')) {
            this.LHCI_BUILD_CONTEXT__COMMIT_MESSAGE = tasklib.getVariable('BUILD_BUILDNUMBER');
            this.LHCI_BUILD_CONTEXT__COMMIT_TIME = new Date().toISOString();
            this.LHCI_BUILD_CONTEXT__AUTHOR = tasklib.getVariable('BUILD_BUILDNUMBER');
            this.LHCI_BUILD_CONTEXT__CURRENT_HASH = tasklib.getVariable('BUILD_SOURCEVERSION');
        }
        // other variables are inferred from git by LHCI.
    }

    private inferBuildContextFromRelease(targetArtifactPath: string) {
        let artifactAlias: string;

        if (!targetArtifactPath) {
            artifactAlias = tasklib.getVariable('RELEASE_PRIMARYARTIFACTSOURCEALIAS').toUpperCase();

            tasklib.debug(`Artifact path not provided. Using primary artifact ${artifactAlias} to populate build context.`);
        }
        else {
            artifactAlias = path.basename(targetArtifactPath).toUpperCase();
            tasklib.debug(`Using artifact ${artifactAlias} to populate build context.`);

        }

        this.LHCI_BUILD_CONTEXT__GITHUB_REPO_SLUG = tasklib.getVariable('LHCI_BUILD_CONTEXT__GITHUB_REPO_SLUG') || tasklib.getVariable(`RELEASE_ARTIFACTS_${artifactAlias}_REPOSITORY_NAME`);
        this.LHCI_BUILD_CONTEXT__CURRENT_BRANCH = tasklib.getVariable('LHCI_BUILD_CONTEXT__CURRENT_BRANCH') || tasklib.getVariable(`RELEASE_ARTIFACTS_${artifactAlias}_SOURCEBRANCH`);

        this.LHCI_BUILD_CONTEXT__AUTHOR = tasklib.getVariable('RELEASE_RELEASENAME');
        this.LHCI_BUILD_CONTEXT__CURRENT_HASH = tasklib.getVariable(`RELEASE_ARTIFACTS_${artifactAlias}_SOURCEVERSION`);
        this.LHCI_BUILD_CONTEXT__COMMIT_TIME = tasklib.getVariable(`RELEASE_DEPLOYMENT_STARTTIME`);
        this.LHCI_BUILD_CONTEXT__COMMIT_MESSAGE = `${tasklib.getVariable('RELEASE_DEFINITIONNAME')} - ${tasklib.getVariable('RELEASE_RELEASENAME')} - ${tasklib.getVariable('RELEASE_ENVIRONMENTNAME')}`;
        this.LHCI_BUILD_CONTEXT__EXTERNAL_BUILD_URL = tasklib.getVariable('RELEASE_RELEASEWEBURL');
    }

    public setBuildContext() {
        for (var key of Object.keys(this)) {

            if (key.startsWith('LHCI_BUILD_CONTEXT') && this[key]) {
                if (!tasklib.getVariable(key)) {
                    tasklib.setVariable(key, this[key], false);
                }
            }
        }
    }
}