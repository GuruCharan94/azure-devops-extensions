import Controls = require("VSS/Controls");
import VSS_Service = require("VSS/Service");

import TFS_Build_Contracts = require("TFS/Build/Contracts");
import TFS_Build_Extension_Contracts = require("TFS/Build/ExtensionContracts");
import DT_Client = require("TFS/DistributedTask/TaskRestClient");

import TFS_Release_Extension_Contracts = require("ReleaseManagement/Core/ExtensionContracts");
import TFS_Release_Contracts = require("ReleaseManagement/Core/Contracts");
import RM_Client = require("ReleaseManagement/Core/RestClient");

import { TabControl } from "VSS/Controls/TabContent";

export class LightHouseBuildResultsSection extends Controls.BaseControl {
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
                                        taskClient.getAttachmentContent(vsoContext.project.id, "build",
                                            build.orchestrationPlan.planId, taskAttachment.timelineId,
                                            taskAttachment.recordId, "gurucharan94.lighthouse-html-artifact", taskAttachment.name
                                        )
                                            .then((attachmentContent) => {
                                                var text = new TextDecoder('utf-8').decode(new Uint8Array(attachmentContent));
                                                var report = $('<iframe>', {
                                                    srcdoc: text,
                                                    id: taskAttachment.name,
                                                    frameborder: '0',
                                                    width: '100%',
                                                    height: '100%',
                                                    scrolling: 'yes',
                                                    marginheight: '0',
                                                    marginwidth: '0',
                                                    class: 'tabcontent'
                                                });

                                                var button = `<button class="tablinks active" onclick="showReport(this,'${taskAttachment.name}')">${taskAttachment.name}</button>`
                                                                
                                                that._element.children(".tab").append(button);
                                                that._element.children(".embeds").append(report);
                                                
                                                if (index == 0 ) {
                                                    that._element.children("p").remove();
                                                }
                                            })
                                    }
                                });
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

export class LightHouseReleaseResultsSection extends Controls.BaseControl {

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
                                
                                                releaseClient.getTaskAttachmentContent(vsoContext.project.id, release.id,
                                                                                                environment.id, deployAttempt.id,
                                                                                                taskAttachment.timelineId, taskAttachment.recordId, 
                                                                                                "gurucharan94.lighthouse-html-artifact", 
                                                                                                taskAttachment.name)
                                                            .then((attachmentContent) => {

                                
                                                                var text = new TextDecoder('utf-8').decode(new Uint8Array(attachmentContent));
                                                                var report = $('<iframe>', {
                                                                    srcdoc: text,
                                                                    id: taskAttachment.name,
                                                                    frameborder: '0',
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    scrolling: 'yes',
                                                                    marginheight: '0',
                                                                    marginwidth: '0',
                                                                    class: 'tabcontent'
                                                                });
                
                                                                var button = `<button class="tablinks active" onclick="showReport(this,'${taskAttachment.name}')">${taskAttachment.name}</button>`
                                                                
                                                                that._element.children(".tab").append(button);
                                                                that._element.children(".embeds").append(report);
                                                                
                                                                if (index == 0 ) {
                                                                    that._element.children("p").remove();
                                                                }
                                                                
                                                                VSS.resize();
                                                            })
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
    LightHouseBuildResultsSection.enhance(LightHouseBuildResultsSection, $("body"), {});
}
if (typeof VSS.getConfiguration().onReleaseChanged == 'function') {
    LightHouseReleaseResultsSection.enhance(LightHouseReleaseResultsSection, $("body"), {});
}

// Notify the parent frame that the host has been loaded
VSS.notifyLoadSucceeded();