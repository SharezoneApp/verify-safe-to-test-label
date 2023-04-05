const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const context = github.context;

        const allowedEvents = ['pull_request', 'pull_request_target', 'merge_group'];
        if (allowedEvents.indexOf(context.eventName) === -1) {
            core.setFailed(`This action only works with the following events: ${allowedEvents.join(', ')}.`);
            return;
        }

        const headRepoFullName = context.payload.pull_request.head.repo.full_name;
        const baseRepoFullName = context.payload.repository.full_name;

        const isFork = headRepoFullName !== baseRepoFullName;
        if (!isFork) {
            console.log(`Pull request is not from a fork, skipping.`);
            return;
        }

        const safeToTestLabelName = core.getInput('label');

        // Check if pull request has the "safe to test" label
        const labels = context.payload.pull_request.labels;
        const hasSafeToTestLabel = labels.find(label => label.name === safeToTestLabelName);
        if (hasSafeToTestLabel) {
            console.log(`Pull request have the "safe-to-test" label, skipping.`);
            return;
        }

        core.setFailed(`Pull request does not have the "safe-to-test" label. Code owners must add the "safe-to-test" label to the pull request before it can be tested.`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

// Export is only used for testing
module.exports = run;

run();
