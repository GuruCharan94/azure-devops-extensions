# Lighthouse CI

[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) is a set of commands that make continuously running, asserting, saving, and retrieving [Lighthouse](https://github.com/GoogleChrome/lighthouse) results as easy as possible.

This extension runs Lighthouse CI as part of your Azure Pipelines.

- TODO : Link to Getting Started with lighthouse blog post.

## Getting Started with Lighthouse CI for Azure Devops

Once the extension is installed, you will see Lighthouse CI task that you can use in build / release pipelines. Below is a screenshot of a sample build pipeline.

![Lighthouse CI Sample Pipeline](https://raw.githubusercontent.com/GuruCharan94/azure-devops-extensions/master/lighthouse-ci/images/demo-pipeline.png)

The `command`, `Configuration File` and `CLI options` are fairly straight forward configurations and map directly to options you would pass to LHCI in the command line.

### Artifact to Infer Build Context From

When uploading to the Lighthouse CI server, the CLI will attempt to [automatically infer the build context](https://github.com/GoogleChrome/lighthouse-ci/blob/master/docs/cli.md#build-context).

When running the tasks inside a build pipeline, most of the context is inferred from the Git Repo. **Any value passed to the `Artifact to infer build context from` input is ignored inside build pipelines.**

When running the tasks **inside a release pipeline**, inferring context get slightly tricky. A release can have multiple artifacts of different types and so you have the option of choosing which artifact you would like to infer build context from. Leaving this blank will lead to the primary artifact of the pipeline being chosen as the one from which to infer build context from. If you want to point to a different artifact for this purpose, **specify the path to the *root folder* of the chosen artifact**.

The extension overrides some bits of the build context using predefined variables from Azure Devops.

[Build Variables](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml)
[Release Variables](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables?view=azure-devops&tabs=batch)

| Name                                     | Build Pipeline                                  | Release Pipeline
| ---------------------------------------- | ----------------------------------------------- |-----------------------------------
| `LHCI_BUILD_CONTEXT__GITHUB_REPO_SLUG`   | `BUILD_REPOSITORY_NAME`                         | `RELEASE_ARTIFACTS_${artifactAlias}_REPOSITORY_NAME`
| `LHCI_BUILD_CONTEXT__CURRENT_HASH`       | Inferred from Git                               | `RELEASE_ARTIFACTS_${artifactAlias}_SOURCEVERSION`
| `LHCI_BUILD_CONTEXT__COMMIT_TIME`        | Inferred from Git                               | `RELEASE_DEPLOYMENT_STARTTIME`
| `LHCI_BUILD_CONTEXT__CURRENT_BRANCH`     | `BUILD_SOURCEBRANCHNAME`                        | `RELEASE_ARTIFACTS_${artifactAlias}_SOURCEBRANCH`
| `LHCI_BUILD_CONTEXT__COMMIT_MESSAGE`     | Inferred from Git                               | `RELEASE_DEFINITIONNAME` - `RELEASE_RELEASENAME` - `RELEASE_ENVIRONMENTNAME`
| `LHCI_BUILD_CONTEXT__AUTHOR`             | Inferred from Git                               | `RELEASE_RELEASENAME`
| `LHCI_BUILD_CONTEXT__EXTERNAL_BUILD_URL` | Link to the Executing Build `BUILD_BUILDID`     | `RELEASE_RELEASEWEBURL`

## Contact

- For issues, bugs, and feature requests, please [raise an issue](https://github.com/GuruCharan94/azure-devops-extensions/issues/new).
- You should also join us in the [Azure DevOps Slack Channel](http://www.azuredevops.club/).
