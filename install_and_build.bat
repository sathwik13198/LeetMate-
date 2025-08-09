@echo off
echo Installing dependencies...
npm install

echo Building the extension...
npm run build

echo Done! The extension has been built to the dist folder.
echo To load the extension in Chrome:
echo 1. Open Chrome and navigate to chrome://extensions/
echo 2. Enable "Developer mode" in the top right corner
echo 3. Click "Load unpacked" and select the dist folder from this project

pause