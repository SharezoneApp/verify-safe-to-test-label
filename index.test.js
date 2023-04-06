const core = require('@actions/core');
const github = require('@actions/github');
const run = require('./index');

jest.mock('@actions/core');
jest.mock('@actions/github');

describe('verify-safe-to-test-label', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should fail when pull request is from a fork and "safe-to-test" label is not assigned', async () => {
        const payload = {
            pull_request: {
                head: {
                    repo: {
                        full_name: 'fork-owner/repo',
                    },
                },
                base: {
                    repo: {
                        full_name: 'base-owner/repo',
                    },
                },
                labels: [],
            },
            repository: {
                full_name: 'base-owner/repo',
            },
        };

        github.context.eventName = 'pull_request';
        github.context.payload = payload;

        core.getInput.mockReturnValue('safe-to-test');

        await run();

        expect(core.setFailed).toHaveBeenCalledWith(
            `Pull request does not have the "safe-to-test" label. Code owners must add the "safe-to-test" label to the pull request before it can be tested.`
        );
    });

    test('should not fail when pull request is from a fork and "safe-to-test" label is assigned', async () => {
        const payload = {
            pull_request: {
                head: {
                    repo: {
                        full_name: 'fork-owner/repo',
                    },
                },
                base: {
                    repo: {
                        full_name: 'base-owner/repo',
                    },
                },
                labels: [
                    {
                        name: 'safe-to-test',
                    },
                ],
            },
            repository: {
                full_name: 'base-owner/repo',
            },
        };

        github.context.eventName = 'pull_request';
        github.context.payload = payload;

        core.getInput.mockReturnValue('safe-to-test');

        await run();

        expect(core.setFailed).toHaveBeenCalledTimes(0);
    });

    test('should not fail when pull request is not from a fork', async () => {
        const payload = {
            pull_request: {
                head: {
                    repo: {
                        full_name: 'base-owner/repo',
                    },
                },
                base: {
                    repo: {
                        full_name: 'base-owner/repo',
                    },
                },
                labels: [],
            },
            repository: {
                full_name: 'base-owner/repo',
            },
        };

        github.context.eventName = 'pull_request';
        github.context.payload = payload;

        core.getInput.mockReturnValue('safe-to-test');

        await run();

        expect(core.setFailed).toHaveBeenCalledTimes(0);
    });

    test('should skip when eventName is not allowed', async () => {
        const payload = {
            pull_request: {
                head: {
                    repo: {
                        full_name: 'fork-owner/repo',
                    },
                },
                base: {
                    repo: {
                        full_name: 'base-owner/repo',
                    },
                },
                labels: [],
            },
            repository: {
                full_name: 'base-owner/repo',
            },
        };

        github.context.eventName = 'not_allowed_event';
        github.context.payload = payload;

        core.getInput.mockReturnValue('safe-to-test');

        await run();

        expect(core.setFailed).toHaveBeenCalledTimes(0);
        expect(github.getOctokit).toHaveBeenCalledTimes(0);
    });

    test('should fail when there is an error', async () => {
        const errorMessage = 'An error occurred';
        github.context.eventName = 'pull_request';
        github.context.payload = null;

        core.getInput.mockReturnValue('safe-to-test');

        try {
            await run();
        } catch (error) {
            expect(core.setFailed).toHaveBeenCalledWith(errorMessage);
        }
    });
});