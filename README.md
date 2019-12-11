# Google Lighthouse extension for Azure Devops

From the [docs](https://developers.google.com/web/tools/lighthouse), Lighthouse is an open-source, automated tool for improving the quality of web pages. It has audits for performance, accessibility, progressive web apps, SEO and more. You give Lighthouse a URL to audit, it runs a series of audits against the page, and then it generates a report on how well the page did.

This extension runs the Lighthouse scan as part of your Azure Pipelines and publishes the reports as part of your pipeline results.

## Getting Started

Once the extension is installed, you will sea a task that you can use in build / release steps. Please provide relevant inputs for the Lighthouse scan.

![Build Pipeline with Lighthouse Task](lighthouse/images/pipeline-demo.png)

You can see the Lighthouse results as a separate tab part of the build summary containing scan results of all the different pages that were scanned.

## Things to Note

- The Lighthouse scan task does not install chrome on the build agent. Chrome is available on the Hosted VS2017 agent but not available on the Hosted Linux Agent.

- Lighthouse scan results viewable only in older release view on Azure Devops.

This is how to go back to the older release results view.

![Going to Old View](lighthouse/images/release-old-view.png)

And the Lighthouse scan results are available in a separate tab as part of release summary.

![Scan Results Release Tab](lighthouse/images/scan-results-release.png)

## Contact

- For issues, bugs, and feature requests, please raise an issue in [this GitHub repository](https://github.com/GuruCharan94/azure-devops-extensions).
- You should also join us in the [Azure DevOps Slack Channel](http://www.azuredevops.club/) Slack Channel.
