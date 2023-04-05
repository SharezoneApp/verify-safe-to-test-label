# verify-safe-to-test-label

A GitHub Action to verifies the "safe to test" label is assigned to a PR, if the
PR is from a fork.

## Motivation

When you have GitHub Actions using secrets, these secrets are not available for
PRs from forks. This is a security feature of GitHub Actions. This means that if
you have a GitHub Action that is triggered by a PR from a fork, it will fail.

The best solution is to not use GitHub secrets in GitHub Actions that are
triggered by PRs from forks (see the blog article from GitHub Security Lab:
[Keeping your GitHub Actions and workflows secure Part 1: Preventing pwn
requests](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)).
However, sometimes this is not possible.

A workaround is to add a label to the PR when it is safe to test. This label is
added by the PR reviewer. Your jobs that are using secrets are only triggered
when this label is present. Otherwise, the job should fail. This is what this
GitHub Action does.

This GitHub Action removes the "safe to test" label when the PR is from a fork.

To remove the "safe to test" label when someone pushes a new commit to the PR,
use the
[remove-safe-to-test-label](https://github.com/nilsreichardt/verify-safe-to-test-label)
GitHub Action.

## Usage

```yaml
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      # This will fail if the PR is from a fork and the "safe to test" label is
      # not present.
      - name: Ensure PR has "safe to test" label, if PR is from a fork
        uses: nilsreichardt/verify-safe-to-test-label@v1
      
      - name: Do something with secrets
```

### Inputs

| Name | Description | Default |
| ---- | ----------- | ------- |
| `label` | The label to remove | `safe to test` |
