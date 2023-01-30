# Contributing to BACOM

## Permissions
Internal employees can reach out to the team on [slack](https://wiki.corp.adobe.com/display/MKTOMD/BACOM+Owners) to get github permissions to contribute to bacom.
External community members who want to contribute can fork the repo.

## Local Setup
Once you've pulled down the repo, follow the local setup instructions included in the [README](/README.md).

## Authoring Experience
We strongly recommend reaching out to the milo community for feedback on your prospective authoring experience (AX) before beginning development. This will help avoid AX issues being flagged in code review which could necessitate a lengthy rewrite. You can post your AX ideas in [slack](https://wiki.corp.adobe.com/display/MKTOMD/BACOM+Owners) to receive feedback. Screenshots are always appreciated.

## Pre-PR Checks
When your code is ready, please make sure all of these items are accounted for prior to creating a PR:
1. Unit Tests are included for any new features and existing tests pass. We aim for 100% code coverage.
2. Linters pass.
3. Performance has been considered. We aim for an upper-90s lighthouse score.
4. Pre-QA testing has been completed:
    1. Should meet accessibility standards for: keyboard navigation, screen reader, and zoom to 200%.
    2. Functionality should work on major browsers for desktop, tablet and mobile devices.
    3. Layout should match designs on major browsers for desktop, tablet, and mobile breakpoints.
    4. See [wiki](https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=MKTOMD&title=QA+Guidance) for full guidance.

## Creating a PR
Push your branch up to the remote and create a PR into `main`. Please follow the PR template.

Your PR should have all of the following:
1. Description.
2. Ticket or issue number linked.
3. Test URLs.
4. Reviewers. Please add the [bacom owners](https://wiki.corp.adobe.com/display/MKTOMD/BACOM+Owners) as reviewers. You can also add the milo core team.
5. Labels. Please add labels if appropriate. If your code doesn't affect the frontend of the site (e.g. updating lint rules), it should be marked "trivial".
6. Assignee. If a PR isn't trivial, it needs to be tested by the [bacom QE](https://wiki.corp.adobe.com/display/MKTOMD/BACOM+Owners). Please add them as the assignee. (Note: This is different from the milo process. For bacom, developers shouldn't be performing verification.) 

## Code Review
The reviewers you added on your PR should provide feedback in a timely manner. You can also tag them on slack for additional visibility.

Reviewers will evaluate the PR based on all of the items previously listed (i.e. AX, unit tests, code quality, performance, accessibility) as well as best practices.

## Verification
Once the code has been approved, please notify the assignee that they can begin verification testing.

If the code won't affect the production site, it should have the "trivial" label and can skip verification.

## Merging
A PR can be merged once all of these items are complete:
1. PR has at least one approver.
2. Comments are resolved.
3. Unit tests pass.
4. Lighthouse test passes (or a valid justification has been provided about why it doesn't pass).
5. Code has been tested by QE (if applicable) and PR has either "verified" or "trivial" labels.

Please notify a [bacom owner](https://wiki.corp.adobe.com/display/MKTOMD/BACOM+Owners) when the PR is ready to be merged.
