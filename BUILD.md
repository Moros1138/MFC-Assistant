# Build Instruction

Once you've downloaded this git, you'll want to run:

npm install

* Downloads all depenecies.
* Runs default gulp task which copies vendor files to the src/options directory
* Runs webpack to compile vue components


Edit config/jwt.js

`const appID = '<MOZILLA ADDON ID HERE>';
const issuer = '<MOZILLA ADDON ISSUER HERE>';
const secret = '<MOZILLA ADDON SECRET HERE>';
const updateURL = '<AUTO UPDATE (updates.json) URL HERE>';

module.exports = {
	appID,
	issuer,
	secret,
	updateURL,
}`

npm build

* Runs webpack to compile vue components
* Runs build gulp task which runs "clean", "bump", and "default" tasks
* Copies extension files to dist/<browser>
* Generates firefox-build.cmd for quick and easy signing!

## Important Notes

You are required to install this in Developer Mode (Google Chrome, Opera) or Load Temporary extension via about:debugging in Firefox because this uses the chrome/extension api and will not work in a standalone server environment!