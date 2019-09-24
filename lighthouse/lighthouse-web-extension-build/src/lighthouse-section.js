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
            var that = this;
            _super.prototype.initialize.call(this);
            var buildConfig = VSS.getConfiguration();
            var vsoContext = VSS.getWebContext();
            if (buildConfig) {
                buildConfig.onBuildChanged(function (build) {
                    if (build.status !== TFS_Build_Contracts.BuildStatus.Completed) {
                        var element = $("<div />");
                        var errorText = "LightHouse results will be available after build is completed...";
                        element.html("<p>" + errorText + "</p>");
                        _this._element.append(element);
                    }
                    if (build.status === TFS_Build_Contracts.BuildStatus.Completed) {
                        var taskClient = DT_Client.getClient();
                        taskClient.getPlanAttachments(vsoContext.project.id, "build", build.orchestrationPlan.planId, "gurucharan94.lighthouse-html-artifact")
                            .then(function (taskAttachments) {
                            if (taskAttachments.length == 0) {
                                var element = $("<div />");
                                var errorText = "No LightHouse report  is available";
                                element.html("<p>" + errorText + "</p>");
                                _this._element.append(element);
                            }
                            else {
                                $.each(taskAttachments, function (index, taskAttachment) {
                                    if (taskAttachment._links && taskAttachment._links.self && taskAttachment._links.self.href) {
                                        var link = $("<a>");
                                        link.attr("href", taskAttachment._links.self.href);
                                        link.attr("title", "Download LightHouse Report");
                                        link.text("Download LightHouse Report");
                                        _this._element.append(link);
                                    }
                                });
                                VSS.resize();
                            }
                        }, function () {
                            var element = $("<div />");
                            var errorText = "No LightHouse report  is available";
                            element.html("<p>" + errorText + "</p>");
                            that._element.append(element);
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
            return _super.call(this) || this;
        }
        LightHouseReleaseResultsTab.prototype.initialize = function () {
            var that = this;
            _super.prototype.initialize.call(this);
            var vsoContext = VSS.getWebContext();
            var releaseConfig = VSS.getConfiguration();
            if (releaseConfig) {
                releaseConfig.onReleaseChanged(function (release) {
                    var releaseClient = RM_Client.getClient();
                    release.environments.forEach(function (environment) {
                        environment.deploySteps.forEach(function (deployAttempt) {
                            environment.deploySteps.forEach(function (steps) {
                                steps.releaseDeployPhases.forEach(function (phases) {
                                    var _this = this;
                                    releaseClient.getTaskAttachments(vsoContext.project.id, release.id, environment.id, deployAttempt.attempt, phases.runPlanId, "gurucharan94.lighthouse-html-artifact")
                                        .then(function (attachments) {
                                        if (attachments.length == 0) {
                                            var element = $("<div />");
                                            var errorText = "No LightHouse report  is available";
                                            element.html("<p>" + errorText + "</p>");
                                            that._element.append(element);
                                        }
                                        else {
                                            $.each(attachments, function (index, taskAttachment) {
                                                if (taskAttachment._links && taskAttachment._links.self && taskAttachment._links.self.href) {
                                                    var link = $("<a>");
                                                    link.attr("href", taskAttachment._links.self.href);
                                                    link.attr("title", "Download LightHouse Report");
                                                    link.text("Download LightHouse Report");
                                                    _this._element.append(link);
                                                    VSS.resize();
                                                }
                                            });
                                        }
                                    }, function () {
                                        var element = $("<div />");
                                        var errorText = "No LightHouse report  is available";
                                        element.html("<p>" + errorText + "</p>");
                                        that._element.append(element);
                                    });
                                });
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
        LightHouseBuildResultsTab.enhance(LightHouseBuildResultsTab, $("body"), {});
    }
    if (typeof VSS.getConfiguration().onReleaseChanged == 'function') {
        LightHouseReleaseResultsTab.enhance(LightHouseReleaseResultsTab, $("body"), {});
    }
    // Notify the parent frame that the host has been loaded
    VSS.notifyLoadSucceeded();
});
