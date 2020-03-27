# Lighthouse CI

[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) is a set of commands that make continuously running, asserting, saving, and retrieving [Lighthouse](https://github.com/GoogleChrome/lighthouse) results as easy as possible.
This extension runs Lighthouse CI as part of your Azure Pipelines.

Read these blog posts for a quick overview of how Lighthouse CI works

- [Getting Started with Lighthouse CI - Part 1](https://www.gurucharan.in/web/nodejs/lighthouse-ci-the-complete-guide-part-1/)
- [Getting Started with Lighthouse CI - Part 2](https://www.gurucharan.in/web/nodejs/lighthouse-ci-the-complete-guide-part-2/)

## Getting Started with Lighthouse CI for Azure Devops

Once the extension is installed, you will see Lighthouse CI task that you can use in build / release pipelines. Below is a screenshot of a sample build pipeline.

![Lighthouse CI Sample Pipeline](https://raw.githubusercontent.com/GuruCharan94/azure-devops-extensions/master/lighthouse-ci/images/demo-pipeline.png)

## Inputs

- Command - Dropdown where you choose one of Collect, Assert, Autorun or Upload.

- Configuration File - Path to the Lighthouse CI configuration file.
  
- CLI options - Command Line Arguments used to override options in configuration file.

- Artifact to Infer Build Context - Used by the task to override [Lighthouse CI's build context](https://github.com/GoogleChrome/lighthouse-ci/blob/master/docs/cli.md#build-context) for `autorun` and `upload` options. You can pretty much leave this blank for other options.

  - **Build Pipelines** - When running the tasks inside a build pipeline, the context is inferred from the Git Repo. Any value passed to this input is *ignored inside build pipelines*.

  - **Release Pipeline** - When running the tasks *inside a release pipeline*, inferring context get slightly tricky. A release can have multiple artifacts of different types and so you have the option of choosing which artifact you would like to infer build context from. Leaving this blank will lead to the primary artifact of the pipeline being chosen as the one from which to infer build context from. If you want to point to a different artifact for this purpose, specify the **path to the root folder** of the chosen artifact. It usually looks like `$(System.DefaultWorkingDirectory)/_my_artifact)`.

## Build Context Override

The build context is set using the help of predefined variables from Azure Devops as shown in the table below. Take a look at pre defined [Build Variables](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml) and [Release Variables](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables?view=azure-devops&tabs=batch)

| Name                                     | Build Pipeline                                  | Release Pipeline
| ---------------------------------------- | ----------------------------------------------- |-----------------------------------
| `LHCI_BUILD_CONTEXT__GITHUB_REPO_SLUG`   | `BUILD_REPOSITORY_NAME`                         | `RELEASE_ARTIFACTS_${artifactAlias}_REPOSITORY_NAME`
| `LHCI_BUILD_CONTEXT__CURRENT_HASH`       | Inferred from Git                               | `RELEASE_ARTIFACTS_${artifactAlias}_SOURCEVERSION`
| `LHCI_BUILD_CONTEXT__COMMIT_TIME`        | Inferred from Git                               | `RELEASE_DEPLOYMENT_STARTTIME`
| `LHCI_BUILD_CONTEXT__CURRENT_BRANCH`     | `BUILD_SOURCEBRANCHNAME`                        | `RELEASE_ARTIFACTS_${artifactAlias}_SOURCEBRANCH`
| `LHCI_BUILD_CONTEXT__COMMIT_MESSAGE`     | Inferred from Git                               | `RELEASE_DEFINITIONNAME` - `RELEASE_RELEASENAME` - `RELEASE_ENVIRONMENTNAME`
| `LHCI_BUILD_CONTEXT__AUTHOR`             | Inferred from Git                               | `RELEASE_RELEASENAME`
| `LHCI_BUILD_CONTEXT__EXTERNAL_BUILD_URL` | Link to the Executing Build `BUILD_BUILDID`     | `RELEASE_RELEASEWEBURL`

You can also override the following settings in the build context using variables of the same name in your Build / Release pipeline.

LHCI_BUILD_CONTEXT__CURRENT_BRANCH
LHCI_BUILD_CONTEXT__GITHUB_REPO_SLUG

## Contact

- For issues, bugs, and feature requests, please [raise an issue](https://github.com/GuruCharan94/azure-devops-extensions/issues/new)
- You should also join us in the [Azure DevOps Slack Channel](http://www.azuredevops.club/)
