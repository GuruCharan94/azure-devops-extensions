import Controls = require("VSS/Controls");
import VSS_Service = require("VSS/Service");

import TFS_Build_Contracts = require("TFS/Build/Contracts");
import TFS_Build_Extension_Contracts = require("TFS/Build/ExtensionContracts");
import DT_Client = require("TFS/DistributedTask/TaskRestClient");

import TFS_Release_Extension_Contracts = require("ReleaseManagement/Core/ExtensionContracts");
import TFS_Release_Contracts = require("ReleaseManagement/Core/Contracts");
import RM_Client = require("ReleaseManagement/Core/RestClient");

import { TabControl } from "VSS/Controls/TabContent";

export class LightHouseBuildResultsTab extends Controls.BaseControl {
    constructor() {
        super();
    }

    public initialize(): void {
        let that = this;
        super.initialize();
        var buildConfig: TFS_Build_Extension_Contracts.IBuildResultsViewExtensionConfig = VSS.getConfiguration();
        var vsoContext = VSS.getWebContext();

        if (buildConfig) {            

            buildConfig.onBuildChanged((build: TFS_Build_Contracts.Build) => {

                if (build.status !== TFS_Build_Contracts.BuildStatus.Completed) {
                    var element = $("<div />");
                    var errorText = "LightHouse results will be available after build is completed...";
                    element.html("<p>" + errorText + "</p>");
                    this._element.append(element);
                }

                if (build.status === TFS_Build_Contracts.BuildStatus.Completed) {
                    var taskClient = DT_Client.getClient();
                    taskClient.getPlanAttachments(vsoContext.project.id, "build", build.orchestrationPlan.planId, "gurucharan94.lighthouse-html-artifact")
                        .then((taskAttachments) => {

                            if (taskAttachments.length == 0) {
                                var element = $("<div />");
                                var errorText = "No LightHouse report  is available";
                                element.html("<p>" + errorText + "</p>");
                                this._element.append(element);
                            }
                            else {
                                $.each(taskAttachments, (index, taskAttachment) => {                                    
                                    if (taskAttachment._links && taskAttachment._links.self && taskAttachment._links.self.href) {
                                                
                                                var link = $("<a>");
                                                link.attr("href", taskAttachment._links.self.href);
                                                link.attr("title", "Download LightHouse Report");
                                                link.text("Download LightHouse Report");
                                                this._element.append(link);
                                       
                                    }
                                });
                                VSS.resize();

                            }
                        },
                            function () {
                                var element = $("<div />");
                                var errorText = "No LightHouse report  is available";
                                element.html("<p>" + errorText + "</p>");
                                that._element.append(element);
                            });
                }
            });
        }
    }
}

export class LightHouseReleaseResultsTab extends Controls.BaseControl {

    constructor() {
        super();
    }

    public initialize(): void {
        let that = this;
        super.initialize();
        var vsoContext = VSS.getWebContext();

        var releaseConfig: TFS_Release_Extension_Contracts.IReleaseViewExtensionConfig = VSS.getConfiguration();
        if (releaseConfig) {

            releaseConfig.onReleaseChanged((release: TFS_Release_Contracts.Release) => {
                let releaseClient: RM_Client.ReleaseHttpClient5 = <RM_Client.ReleaseHttpClient5>RM_Client.getClient();

                release.environments.forEach(function (environment) {

                    environment.deploySteps.forEach(function (deployAttempt) {


                        environment.deploySteps.forEach(function(steps){
                            steps.releaseDeployPhases.forEach(function(phases){
                                
                                releaseClient.getTaskAttachments(vsoContext.project.id, release.id,
                                                            environment.id, deployAttempt.attempt,
                                                            phases.runPlanId,
                                                            "gurucharan94.lighthouse-html-artifact")
                                .then((attachments) => {
                                
                                    if (attachments.length == 0) {
                                        var element = $("<div />");
                                        var errorText = "No LightHouse report  is available";
                                        element.html("<p>" + errorText + "</p>");
                                        that._element.append(element);
                                    }                                
                                    else {                                    
                                        $.each(attachments, (index, taskAttachment) => {
                                            
                                            if (taskAttachment._links && taskAttachment._links.self && taskAttachment._links.self.href) {
                                
                                                var link = $("<a>");
                                                link.attr("href", taskAttachment._links.self.href);
                                                link.attr("title", "Download LightHouse Report");
                                                link.text("Download LightHouse Report");
                                                this._element.append(link);
                                                VSS.resize();
                                            }
                                        });
                                    }
                                },
                                function () {

                                    var element = $("<div />");
                                    var errorText = "No LightHouse report  is available";
                                    element.html("<p>" + errorText + "</p>");
                                    that._element.append(element);
                                })                        
                                })
                        }) 
                    })
                })
            })
        }
    }
}

if (typeof VSS.getConfiguration().onBuildChanged == 'function') {
    LightHouseBuildResultsTab.enhance(LightHouseBuildResultsTab, $("body"), {});
}
if (typeof VSS.getConfiguration().onReleaseChanged == 'function') {
    LightHouseReleaseResultsTab.enhance(LightHouseReleaseResultsTab, $("body"), {});
}

// Notify the parent frame that the host has been loaded
VSS.notifyLoadSucceeded();