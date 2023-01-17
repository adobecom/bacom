# Bacom
The Franklin based project for business.adobe.com. Based off of milo-college.

## Developing
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `sudo npm install -g @adobe/helix-cli`
2. Run `hlx up` this repo's folder. (opens your browser at `http://localhost:3000`)
3. Open this repo's folder in your favorite editor and start coding.

### Husky Pre-Commit
1. After pulling the main branch, make sure to run `npm install` to get the husky pre-commit package.
2. Husky will run the linter before your commit, and will fail if the linter fails. 
3. To bypass this, add the `--no-verify` flag after your commit message. e.g. `git commit -m "First" --no-verify`.

## Testing Milo Changes on Bacom Pages
1. Run 'hlx up' in this folder to ensure the bacom site is running locally. 
2. Make changes in milo, and then from the milo folder, run `npm run libs`.
3. Milo will run at:
```
http://localhost:6456
```
4. On your `localhost:3000/` or the `main-<project>-<owner>` versions of your site, add the URL params: `?milolibs=local`
5. You should see milo changes occuring on bacom pages.
6. When needing to test on a bacom page while making a PR for milo, add the URL params: `?milolibs=<name-of-milo-branch>`to your test URLs.

## Creating New Blocks
When creating new blocks, first vet any requirements/author-experience in milo-community. There may be a way to acheive your goals with what currently exists in milo. 

## Testing
```sh
npm run test
```
or:
```sh
npm run test:watch
```
This will give you several options to debug tests. Note: coverage may not be accurate.
