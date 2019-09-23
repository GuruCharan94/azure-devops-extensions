var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "VSS/Controls", "TFS/Build/Contracts", "TFS/DistributedTask/TaskRestClient", "ReleaseManagement/Core/RestClient"], function (require, exports, Controls, TFS_Build_Contracts, DT_Client, RM_Client) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LightHouseBuildResultsTab = /** @class */ (function (_super) {
        __extends(LightHouseBuildResultsTab, _super);
        function LightHouseBuildResultsTab() {
            return _super.call(this) || this;
        }
        LightHouseBuildResultsTab.prototype.initialize = function () {
            var _this = this;
            _super.prototype.initialize.call(this);
            var buildConfig = VSS.getConfiguration();
            var vsoContext = VSS.getWebContext();
            if (buildConfig) {
                buildConfig.onBuildChanged(function (build) {
                    if (build.status !== TFS_Build_Contracts.BuildStatus.Completed) {
                        var element = $("<div />");
                        var errorText = "LightHouse results will be available after build is completed...";
                        element.html("<p>" + errorText + "</p>");
                        _this._element.replaceWith(element);
                    }
                    if (build.status === TFS_Build_Contracts.BuildStatus.Completed) {
                        var taskClient = DT_Client.getClient();
                        taskClient.getPlanAttachments(vsoContext.project.id, "build", build.orchestrationPlan.planId, "gurucharan94.lighthouse-html-artifact")
                            .then(function (taskAttachments) {
                            if (taskAttachments.length == 0) {
                                var element = $("<div />");
                                var errorText = "No LightHouse report  is available";
                                element.html("<p>" + errorText + "</p>");
                                _this._element.replaceWith(element);
                            }
                            else {
                                $.each(taskAttachments, function (index, taskAttachment) {
                                    if (taskAttachment._links && taskAttachment._links.self && taskAttachment._links.self.href) {
                                        taskClient.getAttachmentContent(vsoContext.project.id, "build", build.orchestrationPlan.planId, taskAttachment.timelineId, taskAttachment.recordId, "gurucharan94.lighthouse-html-artifact", taskAttachment.name)
                                            .then(function (attachmentContent) {
                                            var text = new TextDecoder('utf-8').decode(new Uint8Array(attachmentContent));
                                            var el = $('<iframe>', {
                                                srcdoc: text,
                                                id: 'lighthouse-result',
                                                frameborder: '0',
                                                width: '100%',
                                                height: '100%',
                                                scrolling: 'yes',
                                                marginheight: '0',
                                                marginwidth: '0'
                                            });
                                            _this._element.replaceWith(el);
                                            VSS.resize();
                                        });
                                    }
                                });
                            }
                        }, function () {
                            var element = $("<div />");
                            var errorText = "No LightHouse report  is available";
                            element.html("<p>" + errorText + "</p>");
                            this._element.replaceWith(element);
                        });
                    }
                });
            }
        };
        return LightHouseBuildResultsTab;
    }(Controls.BaseControl));
    exports.LightHouseBuildResultsTab = LightHouseBuildResultsTab;
    var LightHouseReleaseResultsTab = /** @class */ (function (_super) {
        __extends(LightHouseReleaseResultsTab, _super);
        function LightHouseReleaseResultsTab() {
            var _this = this;
            console.log("Constructor");
            _this = _super.call(this) || this;
            return _this;
        }
        LightHouseReleaseResultsTab.prototype.initialize = function () {
            console.log("Init");
            _super.prototype.initialize.call(this);
            var vsoContext = VSS.getWebContext();
            var releaseConfig = VSS.getConfiguration();
            if (releaseConfig) {
                console.log("Release Config");
                releaseConfig.onReleaseChanged(function (release) {
                    var releaseClient = RM_Client.getClient();
                    release.environments.forEach(function (environment) {
                        console.log("Enviroment : " + environment.name);
                        environment.deploySteps.forEach(function (deployAttempt) {
                            var _this = this;
                            console.log("Deploy : " + deployAttempt.status);
                            releaseClient.getReleaseTaskAttachments(vsoContext.project.id, release.id, environment.id, deployAttempt.id, deployAttempt.runPlanId, "gurucharan94.lighthouse-html-artifact")
                                .then(function (attachments) {
                                console.log("Got Attachments: " + attachments.length);
                                if (attachments.length == 0) {
                                    var element = $("<div />");
                                    var errorText = "No LightHouse report  is available";
                                    element.html("<p>" + errorText + "</p>");
                                    _this._element.replaceWith(element);
                                }
                                else {
                                    $.each(attachments, function (index, taskAttachment) {
                                        if (taskAttachment._links && taskAttachment._links.self && taskAttachment._links.self.href) {
                                            console.log("Found matching attachments");
                                            releaseClient.getReleaseTaskAttachmentContent(vsoContext.project.id, release.id, environment.id, deployAttempt.id, deployAttempt.runPlanId, taskAttachment.timelineId, taskAttachment.recordId, "gurucharan94.lighthouse-html-artifact", taskAttachment.name)
                                                .then(function (attachmentContent) {
                                                console.log("Processing Lighthouse Result");
                                                var text = new TextDecoder('utf-8').decode(new Uint8Array(attachmentContent));
                                                var el = $('<iframe>', {
                                                    srcdoc: text,
                                                    id: 'lighthouse-result',
                                                    frameborder: '0',
                                                    width: '100%',
                                                    height: '100%',
                                                    scrolling: 'yes',
                                                    marginheight: '0',
                                                    marginwidth: '0'
                                                });
                                                _this._element.replaceWith(el);
                                                VSS.resize();
                                            });
                                        }
                                    });
                                }
                            }, function () {
                                console.log("Getting Attachments Failed...");
                                var element = $("<div />");
                                var errorText = "No LightHouse report  is available";
                                element.html("<p>" + errorText + "</p>");
                                this._element.replaceWith(element);
                            });
                        });
                    });
                });
            }
        };
        return LightHouseReleaseResultsTab;
    }(Controls.BaseControl));
    exports.LightHouseReleaseResultsTab = LightHouseReleaseResultsTab;
    if (typeof VSS.getConfiguration().onBuildChanged == 'function') {
        LightHouseBuildResultsTab.enhance(LightHouseBuildResultsTab, $(".lighthouse-result"), {});
    }
    if (typeof VSS.getConfiguration().onReleaseChanged == 'function') {
        console.log("In Release");
        LightHouseReleaseResultsTab.enhance(LightHouseReleaseResultsTab, $(".lighthouse-result"), {});
    }
    // Notify the parent frame that the host has been loaded
    VSS.notifyLoadSucceeded();
});
